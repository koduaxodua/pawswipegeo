import { useState, useEffect, useCallback } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';

const KEY = 'pawswipe_delete_requests';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPersistedPetId(petId: string): boolean {
  return UUID_RE.test(petId);
}

export function canRequestPetDeletion(petId: string): boolean {
  return isPersistedPetId(petId) || !isSupabaseConfigured;
}

function readCachedRequestIds(): string[] {
  try {
    const stored = localStorage.getItem(KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    const ids = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];

    // In production the server table is authoritative. Ignore old cached UUIDs
    // so a previously failed request can be submitted again.
    return isSupabaseConfigured ? ids.filter(id => !isPersistedPetId(id)) : ids;
  } catch {
    return [];
  }
}

export function useDeleteRequests() {
  const [ids, setIds] = useState<string[]>(() => readCachedRequestIds());

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const requestDelete = useCallback(async (petId: string) => {
    if (isPersistedPetId(petId)) {
      const res = await fetch('/api/pet-deletion-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId }),
      });
      if (!res.ok) {
        throw new Error('request_failed');
      }
    } else if (isSupabaseConfigured) {
      throw new Error('non_persisted_pet');
    }
    setIds(prev => (prev.includes(petId) ? prev : [...prev, petId]));
  }, []);

  const cancelRequest = useCallback((petId: string) => {
    setIds(prev => prev.filter(id => id !== petId));
  }, []);

  const clearAll = useCallback(() => setIds([]), []);

  const isRequested = useCallback((petId: string) => ids.includes(petId), [ids]);

  return { requestedIds: ids, requestDelete, cancelRequest, clearAll, isRequested };
}
