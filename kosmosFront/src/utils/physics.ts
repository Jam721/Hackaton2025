export const calculateDistance = (
    pos1: [number, number, number],
    pos2: [number, number, number]
): number => {
    const dx = pos2[0] - pos1[0];
    const dy = pos2[1] - pos1[1];
    const dz = pos2[2] - pos1[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const astronomicalUnitsToKm = (au: number): number => {
    return au * 149597870.7; // 1 AU в километрах
};

export const kmToAstronomicalUnits = (km: number): number => {
    return km / 149597870.7;
};