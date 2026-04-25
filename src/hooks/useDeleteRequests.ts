import { useState, useEffect, useCallback } from 'react';

const KEY = 'pawswipe_delete_requests';

export function useDeleteRequests() {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const requestDelete = useCallback((petId: string) => {
    setIds(prev => (prev.includes(petId) ? prev : [...prev, petId]));
  }, []);

  const cancelRequest = useCallback((petId: string) => {
    setIds(prev => prev.filter(id => id !== petId));
  }, []);

  const clearAll = useCallback(() => setIds([]), []);

  const isRequested = useCallback((petId: string) => ids.includes(petId), [ids]);

  return { requestedIds: ids, requestDelete, cancelRequest, clearAll, isRequested };
}
