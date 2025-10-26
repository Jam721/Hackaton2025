import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ObservationList from '../../components/ObservationList/ObservationList';
import AddObservationForm from '../../components/AddObservationForm/AddObservationForm';
import styles from './ObservationsPage.module.css';

const BASE_URL = 'http://172.20.10.2:5075/api';

const ObservationsPage = () => {
    const [observations, setObservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [csvLoading, setCsvLoading] = useState(false);
    const [csvError, setCsvError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchObservations();
    }, []);

    const fetchObservations = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/observation/all`);
            if (!response.ok) throw new Error('Ошибка загрузки данных');
            const data = await response.json();
            setObservations(data);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка загрузки исследований:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddObservation = async (observationData) => {
        try {
            const response = await fetch(`${BASE_URL}/observation/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': '*/*'
                },
                body: JSON.stringify({
                    observationTime: new Date(observationData.observationTime).toISOString(),
                    rightAscension: parseFloat(observationData.rightAscension),
                    declination: parseFloat(observationData.declination),
                    cometId: parseInt(observationData.cometId)
                }),
            });

            if (response.ok) {
                const newObservation = await response.json();
                setObservations(prev => [...prev, newObservation]);
                return true;
            } else {
                throw new Error('Ошибка при добавлении исследования');
            }
        } catch (error) {
            setError(error.message);
            console.error('Ошибка добавления исследования:', error);
            return false;
        }
    };

    const handleCsvUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setCsvLoading(true);
        setCsvError(null);

        try {
            const text = await readFileAsText(file);
            const observationsData = parseCSV(text);

            const results = [];
            for (const observationData of observationsData) {
                try {
                    const success = await handleAddObservation(observationData);
                    results.push({
                        data: observationData,
                        success: success
                    });
                } catch (error) {
                    results.push({
                        data: observationData,
                        success: false,
                        error: error.message
                    });
                }
            }

            // Показываем статистику загрузки
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            if (failed > 0) {
                setCsvError(`Успешно загружено: ${successful}, Ошибок: ${failed}`);
            } else {
                setCsvError(`Все наблюдения (${successful}) успешно загружены!`);
            }

            // Обновляем список наблюдений
            fetchObservations();

        } catch (error) {
            setCsvError('Ошибка при обработке CSV файла: ' + error.message);
            console.error('Ошибка обработки CSV:', error);
        } finally {
            setCsvLoading(false);
            // Сбрасываем значение input чтобы можно было загрузить тот же файл снова
            event.target.value = '';
        }
    };

    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    };

    const parseCSV = (csvText) => {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const observations = [];

        // Пропускаем заголовок (первую строку)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = line.split(',').map(col => col.trim());

            if (columns.length < 4) {
                throw new Error(`Неверный формат CSV: строка ${i + 1} должна содержать 4 колонки`);
            }

            const observationData = {
                observationTime: columns[0],
                rightAscension: parseFloat(columns[1]),
                declination: parseFloat(columns[2]),
                cometId: parseInt(columns[3])
            };

            // Валидация данных
            if (isNaN(observationData.rightAscension)) {
                throw new Error(`Неверное значение прямого восхождения в строке ${i + 1}`);
            }
            if (isNaN(observationData.declination)) {
                throw new Error(`Неверное значение склонения в строке ${i + 1}`);
            }
            if (isNaN(observationData.cometId)) {
                throw new Error(`Неверное значение cometId в строке ${i + 1}`);
            }

            observations.push(observationData);
        }

        return observations;
    };

    const handleDeleteObservation = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить это исследование?')) {
            try {
                const response = await fetch(`${BASE_URL}/observation/delete/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'accept': '*/*'
                    }
                });

                if (response.ok || response.status === 204) {
                    setObservations(observations.filter(obs => obs.id !== id));
                } else {
                    throw new Error('Ошибка при удалении исследования');
                }
            } catch (error) {
                setError(error.message);
                console.error('Ошибка удаления исследования:', error);
            }
        }
    };

    const handleSelectObservation = (id) => {
        navigate(`/observations/${id}`);
    };

    if (loading) {
        return (
            <div className={styles.observationsPage}>
                <div className={styles.container}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Загрузка исследований...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.observationsPage}>
                <div className={styles.container}>
                    <div className={styles.errorContainer}>
                        <h2>Ошибка загрузки данных</h2>
                        <p>{error}</p>
                        <button onClick={fetchObservations} className={styles.retryButton}>
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.observationsPage}>
            <div className={styles.container}>
                <h1>🔭 Астрономические исследования</h1>

                {/* Форма добавления CSV */}
                <div className={styles.csvSection}>
                    <h3>Добавить наблюдения из CSV</h3>
                    <div className={styles.csvUpload}>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleCsvUpload}
                            disabled={csvLoading}
                            className={styles.fileInput}
                        />
                        {csvLoading && (
                            <div className={styles.csvLoading}>
                                <div className={styles.spinner}></div>
                                <span>Загрузка CSV...</span>
                            </div>
                        )}
                        {csvError && (
                            <div className={csvError.includes('Ошибка') ? styles.csvError : styles.csvSuccess}>
                                {csvError}
                            </div>
                        )}
                    </div>
                    <div className={styles.csvHelp}>
                        <p><strong>Формат CSV файла:</strong></p>
                        <p>Первая строка - заголовок: observationTime,rightAscension,declination,cometId</p>
                        <p>Пример:</p>
                        <pre>
                            {`observationTime,rightAscension,declination,cometId
2024-01-15T20:30:00,12.345,45.678,1
2024-01-15T21:00:00,13.456,46.789,2`}
                        </pre>
                    </div>
                </div>

                <AddObservationForm onSubmit={handleAddObservation} />
                <ObservationList
                    observations={observations}
                    onDelete={handleDeleteObservation}
                    onSelect={handleSelectObservation}
                />
            </div>
        </div>
    );
};

export default ObservationsPage;