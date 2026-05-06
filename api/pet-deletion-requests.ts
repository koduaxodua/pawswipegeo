import type { ApiRequest, ApiResponse } from './_admin.js';
import { isUuid, readJson, sendJson, sendMethodNotAllowed, supabaseRest } from './_admin.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    sendMethodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const body = await readJson<{
      petId?: string;
      requesterContact?: string;
      reason?: string;
    }>(req);

    if (!isUuid(body.petId)) {
      sendJson(res, 400, { error: 'invalid_pet_id' });
      return;
    }

    const existingResult = await supabaseRest<Array<{ id: string }>>(
      `pet_deletion_requests?select=id&pet_id=eq.${encodeURIComponent(body.petId)}&status=eq.pending&limit=1`
    );

    if (existingResult.error) {
      console.error('[pet-deletion-requests] duplicate check failed', {
        status: existingResult.error.status,
        message: existingResult.error.message,
      });
      sendJson(res, 500, { error: 'request_failed' });
      return;
    }

    if ((existingResult.data ?? []).length > 0) {
      sendJson(res, 200, { ok: true, duplicate: true });
      return;
    }

    const result = await supabaseRest('pet_deletion_requests', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        pet_id: body.petId,
        requester_contact: body.requesterContact?.slice(0, 500) || null,
        reason: body.reason?.slice(0, 1000) || null,
      }),
    });

    if (result.error) {
      console.error('[pet-deletion-requests] insert failed', {
        status: result.error.status,
        message: result.error.message,
      });
      sendJson(res, 500, { error: 'request_failed' });
      return;
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error('[pet-deletion-requests] server error', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    sendJson(res, 400, { error: 'invalid_request' });
  }
}
