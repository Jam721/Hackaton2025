import React from 'react';
import styles from './ObservationList.module.css';

const ObservationList = ({ observations, onDelete, onSelect }) => {
    if (observations.length === 0) {
        return (
            <div className={styles.observationList}>
                <div className={styles.emptyState}>
                    <h3>🌌 Пока нет исследований</h3>
                    <p>Добавьте первое исследование, используя форму выше</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.observationList}>
            <h2>📋 Список исследований ({observations.length})</h2>
            {observations.map(observation => (
                <div key={observation.id} className={styles.observationItem}>
                    <div
                        className={styles.observationContent}
                        onClick={() => onSelect(observation.id)}
                    >
            <span className={styles.observationId}>
              #{observation.id}
            </span>
                        <span className={styles.observationTime}>
              📅 {new Date(observation.observationTime).toLocaleDateString('ru-RU')}
            </span>
                        <span className={styles.coordinates}>
              🎯 RA: {observation.rightAscension}° • Dec: {observation.declination}°
            </span>
                        <span className={styles.cometId}>
              ☄️ Комета ID: {observation.cometId}
            </span>
                    </div>
                    <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(observation.id);
                        }}
                        title="Удалить исследование"
                    >
                        🗑️ Удалить
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ObservationList;