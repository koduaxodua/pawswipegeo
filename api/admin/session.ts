import type { ApiRequest, ApiResponse } from '../_admin.js';
import { AdminAuthError, requireAdmin, sendJson, sendMethodNotAllowed } from '../_admin.js';

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    sendMethodNotAllowed(res, ['GET']);
    return;
  }

  try {
    requireAdmin(req);
    sendJson(res, 200, { ok: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      sendJson(res, 401, { error: 'unauthorized' });
      return;
    }
    sendJson(res, 500, { error: 'server_error' });
  }
}
