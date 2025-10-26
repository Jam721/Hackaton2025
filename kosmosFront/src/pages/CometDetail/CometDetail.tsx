import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import Comet3D from '../../components/Comet3D/Comet3D';
import CometInfo from '../../components/CometInfo/CometInfo';
import { useCometData } from '../../hooks/useCometData';
import styles from './CometDetail.module.css';

const CometDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { comet, loading, error } = useCometData(Number(id));

    const handleBackClick = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingText}>Загрузка данных о комете...</div>
            </div>
        );
    }

    if (error || !comet) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorText}>
                    {error || 'Комета не найдена'}
                </div>
                <button className={styles.backButton} onClick={handleBackClick}>
                    Вернуться назад
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Левая часть - 3D сцена с кометой */}
            <div className={styles.cometSection}>
                <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                    <ambientLight intensity={0.4} />
                    <pointLight position={[5, 5, 5]} intensity={1.2} color="#4fc3f7" />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} />

                    {/* Звездный фон */}
                    <Stars radius={100} depth={50} count={5000} factor={4} />

                    {/* Комета с анимацией */}
                    <Comet3D />

                    {/* Управление камерой */}
                    <OrbitControls
                        enableZoom={true}
                        enablePan={false}
                        enableRotate={true}
                        zoomSpeed={0.6}
                        rotateSpeed={0.4}
                        minDistance={3}
                        maxDistance={15}
                    />
                </Canvas>
            </div>

            <div className={styles.infoSection}>
                <CometInfo comet={comet} />
            </div>

            <div className={styles.backgroundElements}>
                <div className={styles.star} style={{ top: '20%', left: '10%', animationDelay: '0s' }}></div>
                <div className={styles.star} style={{ top: '60%', left: '85%', animationDelay: '1s' }}></div>
                <div className={styles.star} style={{ top: '80%', left: '15%', animationDelay: '2s' }}></div>
                <div className={styles.star} style={{ top: '30%', left: '70%', animationDelay: '3s' }}></div>
            </div>
        </div>
    );
};

export default CometDetail;