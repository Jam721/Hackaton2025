export interface CelestialBody {
    id: string;
    name: string;
    type: 'star' | 'planet' | 'comet';
    position: [number, number, number];
    scale: number;
    modelPath: string;
    radius?: number;
    orbitSpeed?: number;
    rotationSpeed?: number;
    orbitRadius?: number;
    orbitCenter?: [number, number, number]; // Центр орбиты
}

export interface CometData {
    id: string;
    name: string;
    description: string;
    distanceFromEarth: number;
    speed: number;
    diameter: number;
    discovered: string;
}