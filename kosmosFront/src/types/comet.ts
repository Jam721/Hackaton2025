export interface Comet {
    id: number;
    name: string;
    designation?: string;
    description?: string;
    discoveryDate: string;
    discoverer?: string;
    createdAt: string;
    imageUrl?: string;
    orbitalPeriod?: number;
    lastPerihelion?: string;
    nextPerihelion?: string;
    magnitude?: number;
}

export interface CometDetailProps {
    comet: Comet;
}

export default class type {
}