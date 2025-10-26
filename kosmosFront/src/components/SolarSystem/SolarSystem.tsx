import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import CelestialBody from './CelestialBody';
import type { CelestialBody as CelestialBodyType } from '../../types/celestial';
import styles from './SolarSystem.module.css';

interface SolarSystemProps {
    bodies: CelestialBodyType[];
    onBodyClick: (body: CelestialBodyType) => void;
    selectedBody: CelestialBodyType | null;
    loading?: boolean;
}

const SolarSystem: React.FC<SolarSystemProps> = ({
                                                     bodies,
                                                     onBodyClick,
                                                     selectedBody,
                                                     loading = false
                                                 }) => {
    const navigate = useNavigate();

    const handleCometDetails = (cometId: string) => {
        navigate(`/comet/${cometId}`);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingText}>Загрузка солнечной системы...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Canvas
                camera={{
                    position: [0, 20, 40],
                    fov: 50
                }}
            >
                {/* Освещение */}
                <ambientLight intensity={0.4} />
                <pointLight position={[-50, -10, -60]} intensity={1.5} color="#ffeb3b" />
                <directionalLight
                    position={[10, 10, 10]}
                    intensity={0.8}
                />

                {/* Фон - звезды */}
                <Stars
                    radius={100}
                    depth={30}
                    count={3000}
                    factor={4}
                    saturation={0.6}
                />

                {/* Небесные тела */}
                {bodies.map((body) => (
                    <CelestialBody
                        key={body.id}
                        body={body}
                        onClick={onBodyClick}
                    />
                ))}

                {/* Управление камерой */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    zoomSpeed={0.8}
                    panSpeed={0.8}
                    rotateSpeed={0.4}
                    minDistance={15}
                    maxDistance={100}
                />
            </Canvas>

            {/* Информационная панель */}
            {selectedBody && (
                <div className={styles.infoPanel}>
                    <h3>{selectedBody.name}</h3>
                    <p>Type: {selectedBody.type}</p>
                    {selectedBody.type === 'comet' && (
                        <button
                            className={styles.detailsButton}
                            onClick={() => handleCometDetails(selectedBody.id)}
                        >
                            Подробнее
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SolarSystem;