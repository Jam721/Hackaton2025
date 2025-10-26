import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Comet3D: React.FC = () => {
    const cometRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<THREE.Points>(null);
    const { scene } = useGLTF('/3d/comet/scene.gltf');

    // Клонируем сцену
    const clonedScene = scene.clone();

    // Создаем частицы для хвоста кометы
    const particleCount = 1000;
    const particles = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Создаем хвост позади кометы
            positions[i3] = -Math.random() * 10 - 2; // X - позади кометы
            positions[i3 + 1] = (Math.random() - 0.5) * 2; // Y - случайное смещение
            positions[i3 + 2] = (Math.random() - 0.5) * 2; // Z - случайное смещение
        }
        return positions;
    }, [particleCount]);

    // Анимация кометы и частиц
    useFrame((state, delta) => {
        if (cometRef.current) {
            // Плавное движение вверх-вниз
            const time = state.clock.getElapsedTime();
            cometRef.current.position.y = Math.sin(time * 0.5) * 0.3;

            // Медленное вращение
            cometRef.current.rotation.y += delta * 0.2;
        }

        if (particlesRef.current) {
            // Анимация частиц - движение в сторону от кометы
            const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3] -= delta * 2; // Движение частиц назад
                positions[i3 + 1] += (Math.random() - 0.5) * delta; // Случайное движение по Y
                positions[i3 + 2] += (Math.random() - 0.5) * delta; // Случайное движение по Z

                // Если частица ушла слишком далеко, возвращаем её к началу
                if (positions[i3] < -15) {
                    positions[i3] = -2;
                    positions[i3 + 1] = (Math.random() - 0.5) * 2;
                    positions[i3 + 2] = (Math.random() - 0.5) * 2;
                }
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <group>
            {/* Комета */}
            <group ref={cometRef} position={[0, 0, 0]} scale={0.8}>
                <primitive object={clonedScene} />
            </group>

            {/* Хвост кометы - частицы */}
            <Points ref={particlesRef} positions={particles}>
                <PointMaterial
                    transparent
                    color="#4fc3f7"
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
};

useGLTF.preload('/3d/comet/scene.gltf');

export default Comet3D;