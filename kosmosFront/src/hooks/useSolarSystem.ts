import { useState, useCallback, useMemo } from 'react';
import type { CelestialBody } from '../types/celestial';
import { useComets } from './useComets';

export const useSolarSystem = () => {
    const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
    const { comets, loading: cometsLoading } = useComets();

    // Функция для генерации позиций комет на основе их ID
    const generateCometPosition = (index: number, total: number) => {
        const angle = (index / total) * Math.PI * 2;
        const radius = 15 + (index % 3) * 5; // Разные радиусы орбит
        const centerX = -5 + Math.sin(angle) * 3;
        const centerZ = -5 + Math.cos(angle) * 3;

        return {
            orbitRadius: radius,
            orbitCenter: [centerX, -5, centerZ] as [number, number, number],
            orbitSpeed: 0.02 + (index * 0.005), // Разные скорости
            rotationSpeed: 0.1 + (index * 0.1) // Разные скорости вращения
        };
    };

    const celestialBodies = useMemo<CelestialBody[]>(() => {
        const baseBodies: CelestialBody[] = [
            {
                id: 'sun',
                name: 'Sun',
                type: 'star',
                position: [-50, -10, -60],
                scale: 0.24,
                modelPath: '/3d/sun/scene.gltf',
                radius: 696340,
                rotationSpeed: 0.01
            },
            {
                id: 'earth',
                name: 'Earth',
                type: 'planet',
                position: [0, 0, 0],
                scale: 0.012,
                modelPath: '/3d/earth/scene.gltf',
                radius: 6371,
                orbitSpeed: 0.01,
                rotationSpeed: 0.3,
                orbitRadius: 5,
                orbitCenter: [-5, -5, 0]
            }
        ];

        // Добавляем кометы из бэкенда
        const cometBodies: CelestialBody[] = comets.map((comet, index) => {
            const position = generateCometPosition(index, comets.length);

            return {
                id: comet.id.toString(),
                name: comet.name,
                type: 'comet' as const,
                position: [-5, -5, 0], // Начальная позиция
                scale: 0.2,
                modelPath: '/3d/comet/scene.gltf',
                orbitSpeed: position.orbitSpeed,
                rotationSpeed: position.rotationSpeed,
                orbitRadius: position.orbitRadius,
                orbitCenter: position.orbitCenter
            };
        });

        return [...baseBodies, ...cometBodies];
    }, [comets]);

    const handleBodyClick = useCallback((body: CelestialBody) => {
        setSelectedBody(body);
        console.log(`Selected: ${body.name}`);
    }, []);

    return {
        celestialBodies,
        selectedBody,
        handleBodyClick,
        loading: cometsLoading
    };
};