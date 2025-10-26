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