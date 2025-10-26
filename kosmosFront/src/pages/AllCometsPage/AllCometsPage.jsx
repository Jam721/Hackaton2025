import React, { useState } from "react";
import { CometCard } from "../../components/cometCard/cometCard";
import { CometAddOverlay } from "../../components/cometAdd/cometAddOverlay";
import { useComets } from "../../hooks/useComets";
import styles from './AllCometsPage.module.css';

export function AllComets() {
    const { comets, loading, error, refetch } = useComets();
    const [showAddOverlay, setShowAddOverlay] = useState(false);
    const [localComets, setLocalComets] = useState([]);

    const allComets = [...localComets, ...comets];

    function handleAddComet(newComet) {
        refetch()
    }

    if (loading) {
        return (
            <div className={styles.allCometsPage}>
                <div className={styles.container}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Загрузка комет...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.allCometsPage}>
                <div className={styles.container}>
                    <div className={styles.errorContainer}>
                        <h2>Ошибка загрузки</h2>
                        <p>{error}</p>
                        <button onClick={refetch} className={styles.retryButton}>
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.allCometsPage}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>☄️ Список комет</h1>
                    <p className={styles.subtitle}>
                        Управление астрономическими объектами для исследований
                    </p>
                </div>

                {showAddOverlay && (
                    <CometAddOverlay
                        onAdd={handleAddComet}
                        onClose={() => setShowAddOverlay(false)}
                    />
                )}

                <div className={styles.cometsGrid}>
                    {/* Card to add new comet */}
                    <div
                        className={styles.addCometCard}
                        onClick={() => setShowAddOverlay(true)}
                        title="Добавить комету"
                    >
                        <div className={styles.addIcon}>+</div>
                        <div className={styles.addText}>Добавить комету</div>
                    </div>

                    {allComets.map((comet) => (
                        <CometCard key={comet.id} comet={comet} />
                    ))}
                </div>

                {allComets.length === 0 && (
                    <div className={styles.emptyState}>
                        <h3>🌌 Пока нет комет</h3>
                        <p>Добавьте первую комету, нажав на кнопку выше</p>
                    </div>
                )}
            </div>
        </div>
    );
}