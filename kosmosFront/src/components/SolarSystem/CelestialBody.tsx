import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import type { CelestialBody as CelestialBodyType } from '../../types/celestial';
import { Group } from "three";
import * as React from "react";

interface CelestialBodyProps {
    body: CelestialBodyType;
    onClick: (body: CelestialBodyType) => void;
}

const CelestialBody: React.FC<CelestialBodyProps> = ({ body, onClick }) => {
    const meshRef = useRef<Group>(null);
    const textRef = useRef<Group>(null);
    const { scene } = useGLTF(body.modelPath);
    const { camera } = useThree();

    const clonedScene = scene.clone();

    useFrame((state, delta) => {
        if (meshRef.current) {
            if (body.rotationSpeed) {
                meshRef.current.rotation.y += body.rotationSpeed * delta;
            }

            if (body.orbitSpeed && body.orbitRadius && body.orbitCenter) {
                const time = state.clock.getElapsedTime();
                const angle = time * body.orbitSpeed;

                const centerX = body.orbitCenter[0];
                const centerY = body.orbitCenter[1];
                const centerZ = body.orbitCenter[2];

                const x = centerX + Math.cos(angle) * body.orbitRadius;
                const z = centerZ + Math.sin(angle) * body.orbitRadius;
                const y = centerY + Math.sin(angle * 0.5) * body.orbitRadius * 0.2;

                meshRef.current.position.set(x, y, z);
            }
        }

        // Поворачиваем текст к камере
        if (textRef.current) {
            textRef.current.lookAt(camera.position);
        }
    });


    return (
        <group
            ref={meshRef}
            position={body.position}
            scale={body.scale}
            onClick={(event) => {
                event.stopPropagation();
                onClick(body);
            }}
            onPointerEnter={() => {
                document.body.style.cursor = 'pointer';
            }}
            onPointerLeave={() => {
                document.body.style.cursor = 'default';
            }}
        >
            <primitive object={clonedScene} />

            {/* Название кометы - всегда смотрит на камеру */}
            {body.type === 'comet' && body.name && (
                <group ref={textRef} position={[0, 4, 0]}>
                    <Text
                        fontSize={3}
                        color="#aaaaaa"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.005}
                        outlineColor="#000000"
                    >
                        {body.name}
                    </Text>
                </group>
            )}
        </group>
    );
};

useGLTF.preload('/3d/sun/scene.gltf');
useGLTF.preload('/3d/earth/scene.gltf');
useGLTF.preload('/3d/comet/scene.gltf');

export default CelestialBody;