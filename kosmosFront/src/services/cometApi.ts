import type {Comet} from '../types/comet';

const API_BASE_URL = 'http://172.20.10.2:5075/api';

export const cometApi = {
    // Получить все кометы
    async getComets(): Promise<Comet[]> {
        console.log(`${API_BASE_URL}/comet`)
        const response = await fetch(`${API_BASE_URL}/comet`);
        if (!response.ok) {
            throw new Error('Failed to fetch comets api');
        }
        return response.json();
    },

    // Получить комету по ID
    async getCometById(id: number): Promise<Comet> {
        const response = await fetch(`${API_BASE_URL}/comet/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch comet with id ${id}`);
        }
        return response.json();
    }
};