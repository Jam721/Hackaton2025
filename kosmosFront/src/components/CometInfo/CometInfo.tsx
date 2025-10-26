import type {Comet} from '../../types/comet';
import styles from './CometInfo.module.css';

interface CometInfoProps {
    comet: Comet;
}

const CometInfo: React.FC<CometInfoProps> = ({ comet }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.name}>{comet.name}</h1>
                {comet.designation && (
                    <p className={styles.designation}>{comet.designation}</p>
                )}
            </div>

            {comet.imageUrl && (
            <img
                src={`${comet.imageUrl}`}
                alt={comet.name}
                className={styles.cometImage}
            />
            )}

            {comet.description && (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Описание</h2>
                    <p className={styles.description}>{comet.description}</p>
                </div>
            )}

            <div className={styles.details}>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Дата открытия:</span>
                    <span className={styles.detailValue}>{formatDate(comet.discoveryDate)}</span>
                </div>

                {comet.discoverer && (
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Первооткрыватель:</span>
                        <span className={styles.detailValue}>{comet.discoverer}</span>
                    </div>
                )}

                {comet.orbitalPeriod && (
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Период обращения:</span>
                        <span className={styles.detailValue}>{comet.orbitalPeriod} лет</span>
                    </div>
                )}

                {comet.lastPerihelion && (
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Последний перигелий:</span>
                        <span className={styles.detailValue}>{formatDate(comet.lastPerihelion)}</span>
                    </div>
                )}

                {comet.nextPerihelion && (
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Следующий перигелий:</span>
                        <span className={styles.detailValue}>{formatDate(comet.nextPerihelion)}</span>
                    </div>
                )}

                {comet.magnitude && (
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Максимальная звездная величина:</span>
                        <span className={styles.detailValue}>{comet.magnitude}</span>
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <button className={styles.calculateButton}>
                    Рассчитать расстояние от Земли
                </button>
                <button className={styles.backButton} onClick={() => window.history.back()}>
                    Назад к солнечной системе
                </button>
            </div>
        </div>
    );
};

export default CometInfo;