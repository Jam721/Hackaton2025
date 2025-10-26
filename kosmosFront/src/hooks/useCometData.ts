import { useState, useEffect } from 'react';
import type { Comet } from '../types/comet';
import { cometApi } from '../services/cometApi';

export const useCometData = (cometId: number) => {
    const [comet, setComet] = useState<Comet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchComet = async () => {
            try {
                setLoading(true);
                const data = await cometApi.getCometById(cometId);
                setComet(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch comet');
                setComet(null);
            } finally {
                setLoading(false);
            }
        };

        if (cometId) {
            fetchComet();
        }
    }, [cometId]);

    return { comet, loading, error };
};