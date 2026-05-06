import type { ApiRequest, ApiResponse } from '../_admin.js';
import {
  AdminAuthError,
  requireAdmin,
  sendJson,
  sendMethodNotAllowed,
  supabaseRest,
} from '../_admin.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    sendMethodNotAllowed(res, ['GET']);
    return;
  }

  try {
    requireAdmin(req);
    const requestsResult = await supabaseRest<DeletionRequest[]>(
      'pet_deletion_requests?select=id,pet_id,requester_contact,reason,status,created_at,reviewed_at&order=created_at.desc&limit=100'
    );

    if (requestsResult.error) {
      console.error('[admin/deletion-requests] request fetch failed', {
        status: requestsResult.error.status,
        message: requestsResult.error.message,
      });
      sendJson(res, 500, { error: 'fetch_failed' });
      return;
    }

    const requests = requestsResult.data ?? [];
    const petIds = Array.from(new Set((requests ?? []).map(request => request.pet_id).filter(Boolean)));
    const petsById = new Map<string, unknown>();

    if (petIds.length > 0) {
      const petIdFilter = encodeURIComponent(`in.(${petIds.join(',')})`);
      const petsResult = await supabaseRest<PetRow[]>(
        `pets?select=id,name,age,location,photo_url,caretaker_name,caretaker_phone,public_lat,public_lng,status&id=${petIdFilter}`
      );

      if (petsResult.error) {
        console.error('[admin/deletion-requests] pet fetch failed', {
          status: petsResult.error.status,
          message: petsResult.error.message,
        });
        sendJson(res, 500, { error: 'fetch_failed' });
        return;
      }

      (petsResult.data ?? []).forEach(pet => petsById.set(pet.id, pet));
    }

    sendJson(res, 200, {
      requests: (requests ?? []).map(request => ({
        ...request,
        pets: petsById.get(request.pet_id) ?? null,
      })),
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      sendJson(res, 401, { error: 'unauthorized' });
      return;
    }
    console.error('[admin/deletion-requests] server error', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    sendJson(res, 500, { error: 'server_error' });
  }
}

type DeletionRequest = {
  id: string;
  pet_id: string;
  requester_contact: string | null;
  reason: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
};

type PetRow = {
  id: string;
  name: string | null;
  age: string | null;
  location: string | null;
  photo_url: string | null;
  caretaker_name: string | null;
  caretaker_phone: string | null;
  public_lat: number | null;
  public_lng: number | null;
  status: string | null;
};
