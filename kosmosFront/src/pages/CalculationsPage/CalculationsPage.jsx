import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './CalculationsPage.module.css';

const BASE_URL = 'http://172.20.10.2:5075/api';

const CalculationsPage = () => {
    const { cometId } = useParams();
    const navigate = useNavigate();
    const [calculations, setCalculations] = useState({
        convergation: null,
        lastParams: null,
        sixParameters: [],
        twoParameters: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comet, setComet] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, [cometId]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchConvergation(),
                fetchLastParams(),
                fetchSixParameters(),
                fetchTwoParameters(),
                fetchCometData()
            ]);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка загрузки вычислений:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConvergation = async () => {
        const response = await fetch(`${BASE_URL}/calculation/convergation/${cometId}`);
        if (response.ok) {
            const data = await response.json();
            setCalculations(prev => ({ ...prev, convergation: data }));
        }
    };

    const fetchLastParams = async () => {
        const response = await fetch(`${BASE_URL}/calculation/last_params/${cometId}`);
        if (response.ok) {
            const data = await response.json();
            setCalculations(prev => ({ ...prev, lastParams: data }));
        }
    };

    const fetchSixParameters = async () => {
        const response = await fetch(`${BASE_URL}/parameters/get-six-parameters/${cometId}`);
        if (response.ok) {
            const data = await response.json();
            setCalculations(prev => ({ ...prev, sixParameters: data }));
        }
    };

    const fetchTwoParameters = async () => {
        const response = await fetch(`${BASE_URL}/parameters/get-two-parameters/${cometId}`);
        if (response.ok) {
            const data = await response.json();
            setCalculations(prev => ({ ...prev, twoParameters: data }));
        }
    };

    const fetchCometData = async () => {
        try {
            const response = await fetch(`${BASE_URL}/comet/${cometId}`);
            if (response.ok) {
                const data = await response.json();
                setComet(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных кометы:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatNumber = (num) => {
        if (num === null || num === undefined) return 'N/A';
        return typeof num === 'number' ? num.toFixed(6) : num;
    };

    if (loading) {
        return (
            <div className={styles.calculationsPage}>
                <div className={styles.container}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Загрузка вычислений...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.calculationsPage}>
                <div className={styles.container}>
                    <div className={styles.errorContainer}>
                        <h2>Ошибка загрузки данных</h2>
                        <p>{error}</p>
                        <button onClick={fetchAllData} className={styles.retryButton}>
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.calculationsPage}>
            <div className={styles.container}>
                <button className={styles.backButton} onClick={() => navigate('/observations')}>
                    ← Назад к исследованиям
                </button>

                <div className={styles.header}>
                    <h1>🧮 Вычисления для кометы</h1>
                    {comet && (
                        <div className={styles.cometHeader}>
                            <h2>{comet.name}</h2>
                            {comet.designation && (
                                <span className={styles.designation}>{comet.designation}</span>
                            )}
                        </div>
                    )}
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>{calculations.sixParameters.length}</span>
                            <span className={styles.statLabel}>Наборов 6 параметров</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>{calculations.twoParameters.length}</span>
                            <span className={styles.statLabel}>Наборов 2 параметров</span>
                        </div>
                    </div>
                </div>

                <div className={styles.calculationsGrid}>
                    {/* Convergation Calculation */}
                    <div className={styles.calculationCard}>
                        <div className={styles.cardHeader}>
                            <h3>🔄 Вычисление сходимости</h3>
                            <span className={styles.cardBadge}>Текущее</span>
                        </div>
                        {calculations.convergation ? (
                            <div className={styles.parametersGrid}>
                                <div className={styles.parameter}>
                                    <label>Большая полуось (a):</label>
                                    <span>{formatNumber(calculations.convergation.semiMajorAxis)} а.е.</span>
                                </div>
                                <div className={styles.parameter}>
                                    <label>Эксцентриситет (e):</label>
                                    <span>{formatNumber(calculations.convergation.eccentricity)}</span>
                                </div>
                                <div className={styles.parameter}>
                                    <label>Наклонение (i):</label>
                                    <span>{formatNumber(calculations.convergation.inclination)}°</span>
                                </div>
                                <div className={styles.parameter}>
                                    <label>Долгота восх. узла (Ω):</label>
                                    <span>{formatNumber(calculations.convergation.longitudeOfAscendingNode)}°</span>
                                </div>
                                <div className={styles.parameter}>
                                    <label>Аргумент перицентра (ω):</label>
                                    <span>{formatNumber(calculations.convergation.argumentOfPeriapsis)}°</span>
                                </div>
                                <div className={styles.parameter}>
                                    <label>Время прохождения перицентра:</label>
                                    <span>{formatNumber(calculations.convergation.timeOfPeriapsisPassage)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.noData}>Данные сходимости недоступны</div>
                        )}
                    </div>

                    {/* Last Parameters Calculation */}
                    <div className={styles.calculationCard}>
                        <div className={styles.cardHeader}>
                            <h3>⏱️ Последние параметры</h3>
                            <span className={styles.cardBadge}>Актуальные</span>
                        </div>
                        {calculations.lastParams ? (
                            <div className={styles.parametersGrid}>
                                <div className={styles.parameter}>
                                    <label>Время схождения:</label>
                                    <span>{formatDate(calculations.lastParams.convTime)}</span>
                                </div>
                                <div className={styles.parameter}>
                                    <label>Расстояние:</label>
                                    <span>{formatNumber(calculations.lastParams.distance)} а.е.</span>
                                </div>
                                <div className={styles.parameter}>
                                    <label>ID кометы:</label>
                                    <span>{calculations.lastParams.cometId}</span>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.noData}>Последние параметры недоступны</div>
                        )}
                    </div>

                    {/* Six Parameters History */}
                    <div className={styles.calculationCard}>
                        <div className={styles.cardHeader}>
                            <h3>📊 История 6 параметров</h3>
                            <span className={styles.cardBadge}>{calculations.sixParameters.length} записей</span>
                        </div>
                        <div className={styles.parametersList}>
                            {calculations.sixParameters.map((params, index) => (
                                <div key={params.id} className={styles.parameterSet}>
                                    <div className={styles.parameterSetHeader}>
                                        <span className={styles.setNumber}>Набор #{index + 1}</span>
                                        {params.userEmail && (
                                            <span className={styles.userEmail}>{params.userEmail}</span>
                                        )}
                                    </div>
                                    <div className={styles.compactGrid}>
                                        <div className={styles.compactParam}>
                                            <span>a: {formatNumber(params.semiMajorAxis)}</span>
                                        </div>
                                        <div className={styles.compactParam}>
                                            <span>e: {formatNumber(params.eccentricity)}</span>
                                        </div>
                                        <div className={styles.compactParam}>
                                            <span>i: {formatNumber(params.inclination)}°</span>
                                        </div>
                                        <div className={styles.compactParam}>
                                            <span>Ω: {formatNumber(params.longitudeOfAscendingNode)}°</span>
                                        </div>
                                        <div className={styles.compactParam}>
                                            <span>ω: {formatNumber(params.argumentOfPeriapsis)}°</span>
                                        </div>
                                        <div className={styles.compactParam}>
                                            <span>T: {formatNumber(params.timeOfPeriapsisPassage)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {calculations.sixParameters.length === 0 && (
                                <div className={styles.noData}>Нет данных по 6 параметрам</div>
                            )}
                        </div>
                    </div>

                    {/* Two Parameters History */}
                    <div className={styles.calculationCard}>
                        <div className={styles.cardHeader}>
                            <h3>🎯 История 2 параметров</h3>
                            <span className={styles.cardBadge}>{calculations.twoParameters.length} записей</span>
                        </div>
                        <div className={styles.parametersList}>
                            {calculations.twoParameters.map((params, index) => (
                                <div key={params.id} className={styles.parameterSet}>
                                    <div className={styles.parameterSetHeader}>
                                        <span className={styles.setNumber}>Набор #{index + 1}</span>
                                        {params.userEmail && (
                                            <span className={styles.userEmail}>{params.userEmail}</span>
                                        )}
                                    </div>
                                    <div className={styles.compactGrid}>
                                        <div className={styles.compactParam}>
                                            <span>Время: {formatDate(params.convTime)}</span>
                                        </div>
                                        <div className={styles.compactParam}>
                                            <span>Расстояние: {formatNumber(params.distance)} а.е.</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {calculations.twoParameters.length === 0 && (
                                <div className={styles.noData}>Нет данных по 2 параметрам</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button onClick={fetchAllData} className={styles.refreshButton}>
                        🔄 Обновить вычисления
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalculationsPage;