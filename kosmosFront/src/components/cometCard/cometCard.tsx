import type { Comet } from "../../types/comet";
import { useNavigate } from "react-router-dom";
import styles from './cometCard.module.css';

export function CometCard({ comet }: { comet: Comet }) {
  const navigate = useNavigate();

  const handleMoreInfo = () => {
    navigate(`/comet/${comet.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getCometImageUrl = (cometData) => {
    if (cometData.imageUrl && cometData.imageUrl.startsWith('http')) {
      return cometData.imageUrl;
    }
    if (cometData.imageUrl) {
      return `http://172.20.10.2:5075/api/${cometData.imageUrl}`;
    }
    // Запасные изображения для комет
    const cometImages = [
      'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=250&fit=crop',
      'https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?w=400&h=250&fit=crop'
    ];
    return cometImages[cometData.id % cometImages.length];
  };

  return (
      <div className={styles.cometCard}>
        <div className={styles.cometImageContainer}>
          <img
              src={getCometImageUrl(comet)}
              alt={`${comet.name} image`}
              className={styles.cometImage}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=250&fit=crop';
              }}
          />
          <div className={styles.imageOverlay}>
            <span className={styles.cometId}>ID: {comet.id}</span>
          </div>
        </div>

        <div className={styles.cometCardBody}>
          <div className={styles.cometHeader}>
            <h3 className={styles.cometName}>{comet.name}</h3>
            {comet.designation && (
                <span className={styles.cometDesignation}>{comet.designation}</span>
            )}
          </div>

          <div className={styles.cometDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>👨‍🔬 Открыватель:</span>
              <span className={styles.detailValue}>{comet.discoverer || "—"}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>📅 Дата открытия:</span>
              <span className={styles.detailValue}>{formatDate(comet.discoveryDate)}</span>
            </div>

            {comet.description && (
                <div className={styles.description}>
                  <p>{comet.description.length > 100
                      ? comet.description.substring(0, 100) + '...'
                      : comet.description}
                  </p>
                </div>
            )}
          </div>

          <button
              className={styles.cometCardButton}
              onClick={handleMoreInfo}
          >
            🔍 Подробнее
          </button>
        </div>
      </div>
  );
}