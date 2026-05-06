import type { ApiRequest, ApiResponse } from '../_admin.js';
import {
  AdminAuthError,
  isUuid,
  readJson,
  requireAdmin,
  sendJson,
  sendMethodNotAllowed,
  supabaseRest,
} from '../_admin.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    sendMethodNotAllowed(res, ['POST']);
    return;
  }

  try {
    requireAdmin(req);
    const body = await readJson<{ petId?: string }>(req);
    if (!isUuid(body.petId)) {
      sendJson(res, 400, { error: 'invalid_pet_id' });
      return;
    }

    const hiddenAt = new Date().toISOString();
    const hideResult = await supabaseRest<Array<{ id: string }>>(
      `pets?id=eq.${encodeURIComponent(body.petId)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ status: 'hidden', hidden_at: hiddenAt }),
      }
    );

    if (hideResult.error) {
      console.error('[admin/hide-pet] hide failed', {
        status: hideResult.error.status,
        message: hideResult.error.message,
      });
      sendJson(res, 500, { error: 'hide_failed' });
      return;
    }
    if ((hideResult.data ?? []).length === 0) {
      sendJson(res, 404, { error: 'not_found' });
      return;
    }

    const requestResult = await supabaseRest(
      `pet_deletion_requests?pet_id=eq.${encodeURIComponent(body.petId)}&status=eq.pending`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'completed', reviewed_at: new Date().toISOString() }),
      }
    );
    if (requestResult.error) {
      console.error('[admin/hide-pet] deletion request status update failed', {
        status: requestResult.error.status,
        message: requestResult.error.message,
      });
    }

    sendJson(res, 200, { ok: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      sendJson(res, 401, { error: 'unauthorized' });
      return;
    }
    console.error('[admin/hide-pet] server error', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    sendJson(res, 500, { error: 'server_error' });
  }
}
