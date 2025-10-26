import { useState, useEffect, useCallback } from 'react';
import type { Comet } from '../types/comet';
import { cometApi } from '../services/cometApi';

export const useComets = () => {
  const [comets, setComets] = useState<Comet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cometApi.getComets();
      setComets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comets');
      setComets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComets();
  }, [fetchComets]);

  return { comets, loading, error, refetch: fetchComets };
};
