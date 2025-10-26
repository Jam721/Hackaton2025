import React, { useState } from "react";
import styles from './cometAddOverlay.module.css';

const API_BASE_URL = 'http://172.20.10.2:5075/api';

async function handleCreateCometApi(params) {
  const formData = new FormData();
  if (params.Name) formData.append("Name", params.Name);
  if (params.Designation) formData.append("Designation", params.Designation);
  if (params.Description) formData.append("Description", params.Description);
  if (params.DiscoveryDate) formData.append("DiscoveryDate", params.DiscoveryDate);
  if (params.Discoverer) formData.append("Discoverer", params.Discoverer);
  if (params.File) formData.append("File", params.File);

  const response = await fetch(`${API_BASE_URL}/comet/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Ошибка при создании кометы');
  }

  return await response.json();
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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await handleCreateCometApi({
        Name: name,
        Designation: designation,
        Description: description,
        DiscoveryDate: discoveryDate,
        Discoverer: discoverer,
        File: file,
      });

      if (onAdd) await onAdd();
      onClose();
    } catch (err) {
      setError(err.message || "Ошибка добавления кометы");
    } finally {
      setLoading(false);
    }
  }

  return (
      <div className={styles.overlayBg}>
        <div className={styles.overlayForm}>
          <button className={styles.overlayCloseBtn} onClick={onClose}>×</button>

          <div className={styles.overlayHeader}>
            <h2>☄️ Добавить комету</h2>
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
                  disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Обозначение</label>
              <input
                  type="text"
                  placeholder="Например: 1P/Halley"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Открыватель</label>
              <input
                  type="text"
                  placeholder="Имя первооткрывателя"
                  value={discoverer}
                  onChange={e => setDiscoverer(e.target.value)}
                  disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Дата открытия</label>
              <input
                  type="date"
                  value={discoveryDate}
                  onChange={e => setDiscoveryDate(e.target.value)}
                  disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Описание</label>
              <textarea
                  placeholder="Описание кометы, особенности, история..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Изображение кометы</label>
              <div className={styles.fileInputContainer}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => setFile(e.target.files[0])}
                    disabled={loading}
                    className={styles.fileInput}
                />
                <span className={styles.fileInputText}>
                {file ? file.name : "Выберите изображение..."}
              </span>
              </div>
            </div>

            {error && (
                <div className={styles.overlayError}>
                  <span>⚠️ {error}</span>
                </div>
            )}

            <div className={styles.formActions}>
              <button
                  type="button"
                  onClick={onClose}
                  className={styles.cancelButton}
                  disabled={loading}
              >
                Отмена
              </button>
              <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitButton}
              >
                {loading ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      Сохранение...
                    </>
                ) : (
                    "➕ Добавить комету"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}