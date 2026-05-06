import type { ApiRequest, ApiResponse } from '../_admin.js';
import { getServiceSupabase, sendJson, sendMethodNotAllowed } from '../_admin.js';

const RETENTION_DAYS = 90;
const BATCH_LIMIT = 100;
const PET_PHOTOS_BUCKET = 'pet-photos';

type HiddenPet = {
  id: string;
  photo_url: string | null;
};

function requireCron(req: ApiRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;
  return Boolean(secret && authHeader === `Bearer ${secret}`);
}

function getPetPhotoPath(photoUrl: string | null): string | null {
  if (!photoUrl) return null;

  try {
    const url = new URL(photoUrl);
    const marker = `/storage/v1/object/public/${PET_PHOTOS_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    const path = url.pathname.slice(markerIndex + marker.length);
    return path ? decodeURIComponent(path) : null;
  } catch {
    return null;
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    sendMethodNotAllowed(res, ['GET']);
    return;
  }

  if (!requireCron(req)) {
    sendJson(res, 401, { error: 'unauthorized' });
    return;
  }

  try {
    const supabase = getServiceSupabase();
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data: candidates, error: candidatesError } = await supabase
      .from('pets')
      .select('id, photo_url')
      .eq('status', 'hidden')
      .not('hidden_at', 'is', null)
      .lte('hidden_at', cutoff)
      .order('hidden_at', { ascending: true })
      .limit(BATCH_LIMIT);

    if (candidatesError) {
      sendJson(res, 500, { error: 'candidate_fetch_failed' });
      return;
    }

    const candidatePets = (candidates ?? []) as HiddenPet[];
    const candidateIds = candidatePets.map(pet => pet.id);
    if (candidateIds.length === 0) {
      sendJson(res, 200, { ok: true, deleted: 0, storageDeleted: 0 });
      return;
    }

    // Pending/reviewed requests act as a temporary manual-review hold. Completed
    // or rejected requests do not block the 90-day deletion window.
    const { data: heldRequests, error: heldRequestsError } = await supabase
      .from('pet_deletion_requests')
      .select('pet_id')
      .in('pet_id', candidateIds)
      .in('status', ['pending', 'reviewed']);

    if (heldRequestsError) {
      sendJson(res, 500, { error: 'hold_fetch_failed' });
      return;
    }

    const heldIds = new Set((heldRequests ?? []).map(request => request.pet_id));
    const deleteIds = candidateIds.filter(id => !heldIds.has(id));
    if (deleteIds.length === 0) {
      sendJson(res, 200, { ok: true, deleted: 0, storageDeleted: 0, held: heldIds.size });
      return;
    }

    const { data: deletedPets, error: deleteError } = await supabase
      .from('pets')
      .delete()
      .in('id', deleteIds)
      .select('id, photo_url');

    if (deleteError) {
      sendJson(res, 500, { error: 'delete_failed' });
      return;
    }

    const storagePaths = Array.from(
      new Set(((deletedPets ?? []) as HiddenPet[]).map(pet => getPetPhotoPath(pet.photo_url)).filter(Boolean))
    ) as string[];

    let storageDeleted = 0;
    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(PET_PHOTOS_BUCKET)
        .remove(storagePaths);

      if (!storageError) {
        storageDeleted = storagePaths.length;
      }
    }

    sendJson(res, 200, {
      ok: true,
      deleted: deletedPets?.length ?? 0,
      storageDeleted,
      held: heldIds.size,
    });
  } catch {
    sendJson(res, 500, { error: 'server_error' });
  }
}
