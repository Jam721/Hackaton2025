import React, { useState } from "react";
import styles from './cometAddOverlay.module.css';

const API_BASE_URL = 'http://172.20.10.2:5075/api';
const PREDICTION_API_URL = 'http://172.20.10.5:8001/predict';

// Функция для создания кометы без изображения
async function handleCreateCometApi(cometData) {
  console.log("Отправляемые данные:", cometData);

  try {
    const response = await fetch(`${API_BASE_URL}/comet/create`, {
      method: "POST",
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: cometData.Name,
        designation: cometData.Designation,
        description: cometData.Description,
        discoveryDate: cometData.DiscoveryDate,
        discoverer: cometData.Discoverer
      }),
    });

    console.log("Статус ответа:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ошибка сервера:", errorText);
      throw new Error(`Ошибка при создании кометы: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка fetch:", error);
    throw error;
  }
}

// Функция для загрузки изображения к комете
async function uploadImageToComet(cometId, file) {
  const formData = new FormData();
  formData.append("request", file);

  try {
    const response = await fetch(`${API_BASE_URL}/comet/add-image?cometId=${cometId}`, {
      method: "POST",
      headers: {
        'accept': '*/*',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки изображения: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Ошибка загрузки изображения:", error);
    throw error;
  }
}

// Функция проверки кометы
async function checkIfComet(imageUrl) {
  try {
    const response = await fetch(PREDICTION_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl
      }),
    });

    if (!response.ok) {
      throw new Error(`Ошибка проверки изображения: ${response.status}`);
    }

    const result = await response.json();
    return result.is_comet === 1;
  } catch (error) {
    console.error("Ошибка проверки кометы:", error);
    throw error;
  }
}

// Функция для удаления временной кометы (если проверка не пройдена)
async function deleteTemporaryComet(cometId) {
  try {
    const response = await fetch(`${API_BASE_URL}/comet/delete/${cometId}`, {
      method: "DELETE",
      headers: {
        'accept': '*/*',
      },
    });

    if (!response.ok) {
      console.warn("Не удалось удалить временную комету, статус:", response.status);
    } else {
      console.log("Временная комета удалена");
    }
  } catch (error) {
    console.error("Ошибка при удалении временной кометы:", error);
  }
}

export function CometAddOverlay({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [description, setDescription] = useState("");
  const [discoveryDate, setDiscoveryDate] = useState("");
  const [discoverer, setDiscoverer] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingComet, setCheckingComet] = useState(false);
  const [cometCheckResult, setCometCheckResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [temporaryCometId, setTemporaryCometId] = useState(null);

  // Функция для загрузки изображения при выборе файла
  const handleFileUpload = async (selectedFile) => {
    if (!selectedFile) return;

    setUploadingImage(true);
    setError("");

    try {
      // Сначала создаем комету с минимальными данными
      const cometResult = await handleCreateCometApi({
        Name: name.trim() || "Временная комета",
        Designation: designation.trim() || "TEMP",
        Description: description.trim() || "Временная комета для проверки изображения",
        DiscoveryDate: discoveryDate ? new Date(discoveryDate + 'T00:00:00Z').toISOString() : new Date().toISOString(),
        Discoverer: discoverer.trim() || "Система",
      });

      const cometId = cometResult.id;
      setTemporaryCometId(cometId);

      // Загружаем изображение к созданной комете
      const uploadResult = await uploadImageToComet(cometId, selectedFile);
      setUploadedImageUrl(uploadResult.image);

      // Автоматически проверяем комету после загрузки изображения
      setCheckingComet(true);
      const isComet = await checkIfComet(uploadResult.image);
      setCometCheckResult(isComet);

      // Если комета не обнаружена, удаляем временную комету
      if (!isComet) {
        await deleteTemporaryComet(cometId);
        setTemporaryCometId(null);
        setError("   На изображении не обнаружено кометы. Добавление невозможно.");
      }

    } catch (err) {
      setError(err.message || "Ошибка загрузки изображения");
      console.error("Ошибка загрузки изображения:", err);
    } finally {
      setUploadingImage(false);
      setCheckingComet(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Базовая валидация
    if (!name.trim()) {
      setError("Название кометы обязательно для заполнения");
      return;
    }

    // Если комета не обнаружена на изображении, блокируем добавление
    if (cometCheckResult === false) {
      setError("Невозможно добавить комету: на изображении не обнаружено кометы");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Если временная комета уже создана и проверка пройдена, обновляем ее данные
      if (temporaryCometId && cometCheckResult === true) {
        // Обновляем данные временной кометы
        await handleCreateCometApi({
          Name: name.trim(),
          Designation: designation.trim(),
          Description: description.trim(),
          DiscoveryDate: discoveryDate ? new Date(discoveryDate + 'T00:00:00Z').toISOString() : null,
          Discoverer: discoverer.trim(),
        });
        console.log("Данные временной кометы обновлены");
      } else if (!temporaryCometId) {
        // Создаем новую комету, если изображение не загружалось
        let formattedDate = discoveryDate;
        if (discoveryDate) {
          formattedDate = new Date(discoveryDate + 'T00:00:00Z').toISOString();
        }

        await handleCreateCometApi({
          Name: name.trim(),
          Designation: designation.trim(),
          Description: description.trim(),
          DiscoveryDate: formattedDate,
          Discoverer: discoverer.trim(),
        });
      }

      if (onAdd) await onAdd();
      onClose();
    } catch (err) {
      setError(err.message || "Ошибка добавления кометы");
      console.error("Ошибка в handleSubmit:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setCometCheckResult(null);
    setUploadedImageUrl(null);
    setTemporaryCometId(null);
    setError("");

    // Создаем превью изображения
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(selectedFile);

      // Автоматически загружаем изображение и проверяем комету
      handleFileUpload(selectedFile);
    } else {
      setImagePreview(null);
    }
  }

  // Функция для удаления изображения
  const handleRemoveImage = async () => {
    if (temporaryCometId && cometCheckResult === false) {
      // Если комета не прошла проверку, удаляем ее
      await deleteTemporaryComet(temporaryCometId);
    }

    setFile(null);
    setImagePreview(null);
    setCometCheckResult(null);
    setUploadedImageUrl(null);
    setTemporaryCometId(null);
    setError("");
  };

  // Определяем, заблокирована ли кнопка отправки
  const isSubmitDisabled =
      loading ||
      !name.trim() ||
      uploadingImage ||
      checkingComet ||
      cometCheckResult === false;

  return (
      <div className={styles.overlayBg}>
        <div className={styles.overlayForm}>
          <button className={styles.overlayCloseBtn} onClick={onClose}>×</button>

          <div className={styles.overlayHeader}>
            <h2>Добавить комету</h2>
            <p>Заполните информацию о новой комете</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Название кометы *</label>
              <input
                  type="text"
                  placeholder="Например: Комета Галлея"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  required
                  disabled={loading || uploadingImage}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Обозначение</label>
              <input
                  type="text"
                  placeholder="Например: 1P/Halley"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  disabled={loading || uploadingImage}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Открыватель</label>
              <input
                  type="text"
                  placeholder="Имя первооткрывателя"
                  value={discoverer}
                  onChange={e => setDiscoverer(e.target.value)}
                  disabled={loading || uploadingImage}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Дата открытия</label>
              <input
                  type="date"
                  value={discoveryDate}
                  onChange={e => setDiscoveryDate(e.target.value)}
                  disabled={loading || uploadingImage}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Описание</label>
              <textarea
                  placeholder="Описание кометы, особенности, история..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  disabled={loading || uploadingImage}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Изображение кометы *</label>
              <div className={styles.fileUploadContainer}>
                <label className={styles.fileUploadLabel}>
                  <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading || uploadingImage}
                      className={styles.fileUploadInput}
                  />
                  <span className={styles.fileUploadButton}>
                    {uploadingImage ? "📤 Загрузка..." : "📁 Выбрать файл"}
                  </span>
                  <span className={styles.fileUploadText}>
                    {file ? file.name : "Файл не выбран"}
                  </span>
                </label>
              </div>

              {/* Превью изображения */}
              {imagePreview && (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Превью" />
                    <button
                        type="button"
                        className={styles.removeImageButton}
                        onClick={handleRemoveImage}
                        disabled={uploadingImage || checkingComet}
                    >
                      ×
                    </button>
                    {(uploadingImage || checkingComet) && (
                        <div className={styles.uploadOverlay}>
                          <div className={styles.loadingSpinner}></div>
                          <span>{uploadingImage ? "Загрузка..." : "Проверка..."}</span>
                        </div>
                    )}
                  </div>
              )}

              {/* Результат проверки кометы */}
              {cometCheckResult !== null && (
                  <div className={styles.cometCheckSection}>
                    <div className={
                      cometCheckResult ? styles.cometCheckSuccess : styles.cometCheckWarning
                    }>
                      {cometCheckResult
                          ? "✅ На изображении обнаружена комета!"
                          : "   На изображении не обнаружено кометы"}
                    </div>

                    {uploadedImageUrl && (
                        <div className={styles.imageUrlInfo}>
                          <a href={uploadedImageUrl} target="_blank" rel="noopener noreferrer" className={styles.imageLink}>
                            🔗 Посмотреть загруженное изображение
                          </a>
                        </div>
                    )}
                  </div>
              )}
            </div>

            {error && (
                <div className={
                  cometCheckResult === false ? styles.overlayWarning : styles.overlayError
                }>
                  <span>{error}</span>
                </div>
            )}

            <div className={styles.formActions}>
              <button
                  type="button"
                  onClick={onClose}
                  className={styles.cancelButton}
                  disabled={loading || uploadingImage}
              >
                Отмена
              </button>
              <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={
                    cometCheckResult === false
                        ? styles.submitButtonDisabled
                        : styles.submitButton
                  }
              >
                {loading ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      Сохранение...
                    </>
                ) : cometCheckResult === false ? (
                    "   Добавление заблокировано"
                ) : uploadedImageUrl ? (
                    "✅ Завершить"
                ) : (
                    "➕ Добавить комету"
                )}
              </button>
            </div>
          </form>

          {/* Информация о процессе */}
          {uploadedImageUrl && cometCheckResult && (
              <div className={styles.processInfo}>
                <p>✅ Изображение загружено и проверено</p>
                <p>   Заполните остальные данные и нажмите "Завершить"</p>
              </div>
          )}

          {cometCheckResult === false && (
              <div className={styles.warningInfo}>
                <p>⚠️ Добавление кометы заблокировано</p>
                <p>Выберите другое изображение с кометой</p>
              </div>
          )}
        </div>
      </div>
  );
}