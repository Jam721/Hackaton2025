import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ObservationDetailPage.module.css';

const BASE_URL = 'http://172.20.10.2:5075/api';

const ObservationDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [observation, setObservation] = useState(null);
    const [comet, setComet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchObservation();
    }, [id]);

    const fetchObservation = async () => {
        try {
            setLoading(true);
            // Получаем все наблюдения и находим нужное по ID
            const response = await fetch(`${BASE_URL}/observation/all`);
            if (!response.ok) throw new Error('Ошибка загрузки наблюдений');
            const observations = await response.json();
            const foundObservation = observations.find(obs => obs.id === parseInt(id));

            if (!foundObservation) {
                throw new Error('Исследование не найдено');
            }

            setObservation(foundObservation);
            await fetchComet(foundObservation.cometId);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка загрузки исследования:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchComet = async (cometId) => {
        try {
            const response = await fetch(`${BASE_URL}/comet/${cometId}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных о комете');
            const cometData = await response.json();
            setComet(cometData);
        } catch (error) {
            console.error('Ошибка загрузки данных о комете:', error);
            // Создаем базовый объект кометы, если не удалось загрузить
            setComet({
                id: cometId,
                name: `Комета #${cometId}`,
                description: 'Информация о комете недоступна'
            });
        }
    };

    const getCometImageUrl = (cometData) => {
        if (cometData.imageUrl && cometData.imageUrl.startsWith('http')) {
            return cometData.imageUrl;
        }
        if (cometData.imageUrl) {
            return `${BASE_URL}/${cometData.imageUrl}`;
        }
        // Запасные изображения для разных комет
        const cometImages = [
            'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=500&h=300&fit=crop',
            'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500&h=300&fit=crop',
            'https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?w=500&h=300&fit=crop'
        ];
        return cometImages[cometData.id % cometImages.length];
    };

    if (loading) {
        return (
            <div className={styles.detailPage}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Загрузка данных исследования...</p>
                </div>
            </div>
        );
    }

    if (error || !observation) {
        return (
            <div className={styles.detailPage}>
                <div className={styles.errorContainer}>
                    <h2>Ошибка</h2>
                    <p>{error || 'Исследование не найдено'}</p>
                    <button onClick={() => navigate('/observations')} className={styles.backButton}>
                        ← Вернуться к списку
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.detailPage}>
            <div className={styles.container}>
                <button className={styles.backButton} onClick={() => navigate('/observations')}>
                    ← Назад к списку исследований
                </button>

                <div className={styles.header}>
                    <h1>🔭 Детали исследования #{observation.id}</h1>
                    <div className={styles.observationMeta}>
                        <span className={styles.badge}>ID: {observation.id}</span>
                        <span className={styles.badge}>Комета: {comet?.name}</span>
                        <span className={styles.badge}>
              📅 {new Date(observation.observationTime).toLocaleDateString('ru-RU')}
            </span>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.mainInfo}>
                        <div className={styles.card}>
                            <h2>📊 Данные наблюдения</h2>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <label>🆔 ID исследования:</label>
                                    <span>{observation.id}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>🕒 Время наблюдения:</label>
                                    <span>{new Date(observation.observationTime).toLocaleString('ru-RU')}</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>🎯 Прямое восхождение (RA):</label>
                                    <span>{observation.rightAscension}°</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>📍 Склонение (Dec):</label>
                                    <span>{observation.declination}°</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>☄️ ID кометы:</label>
                                    <span>{observation.cometId}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2>☄️ Информация о комете</h2>
                            {comet ? (
                                <div className={styles.cometInfo}>
                                    <div className={styles.cometHeader}>
                                        <h3>{comet.name}</h3>
                                        {comet.designation && (
                                            <span className={styles.designation}>{comet.designation}</span>
                                        )}
                                    </div>

                                    <p className={styles.description}>
                                        {comet.description || 'Описание кометы недоступно'}
                                    </p>

                                    <div className={styles.cometDetails}>
                                        {comet.discoverer && (
                                            <div className={styles.detailItem}>
                                                <span className={styles.label}>👨‍🔬 Первооткрыватель:</span>
                                                <span>{comet.discoverer}</span>
                                            </div>
                                        )}
                                        {comet.discoveryDate && (
                                            <div className={styles.detailItem}>
                                                <span className={styles.label}>📅 Дата открытия:</span>
                                                <span>{new Date(comet.discoveryDate).toLocaleDateString('ru-RU')}</span>
                                            </div>
                                        )}
                                        {comet.createdAt && (
                                            <div className={styles.detailItem}>
                                                <span className={styles.label}>📝 Дата создания записи:</span>
                                                <span>{new Date(comet.createdAt).toLocaleDateString('ru-RU')}</span>
                                            </div>
                                        )}
                                        <div className={styles.detailItem}>
                                            <span className={styles.label}>🆔 ID кометы:</span>
                                            <span>{comet.id}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.noCometData}>
                                    <p>Данные о комете не найдены</p>
                                </div>
                            )}
                        </div>
                    </div>

                    // Добавим эту кнопку после backButton в ObservationDetailPage.jsx
                    <button
                        className={styles.calculationsButton}
                        onClick={() => navigate(`/calculations/${observation.cometId}`)}
                    >
                        🧮 Показать вычисления
                    </button>

                    <div className={styles.sidebar}>
                        <div className={styles.imageCard}>
                            <h3>🖼️ Изображение кометы</h3>
                            <div className={styles.imageContainer}>
                                <img
                                    src={getCometImageUrl(comet)}
                                    alt={comet?.name}
                                    className={styles.cometImage}
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=500&h=300&fit=crop';
                                    }}
                                />
                                <div className={styles.imageOverlay}>
                                    <span>{comet?.name}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.statsCard}>
                            <h3>📈 Информация о наблюдении</h3>
                            <div className={styles.stats}>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>✓</span>
                                    <span className={styles.statLabel}>Статус: Завершено</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statValue}>⭐</span>
                                    <span className={styles.statLabel}>Качество: Отличное</span>
                                </div>
                                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    {new Date(observation.observationTime).toLocaleDateString('ru-RU')}
                  </span>
                                    <span className={styles.statLabel}>Дата наблюдения</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ObservationDetailPage;