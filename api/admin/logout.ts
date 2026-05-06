import type { ApiRequest, ApiResponse } from '../_admin.js';
import { clearAdminSessionCookie, sendJson, sendMethodNotAllowed } from '../_admin.js';

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    sendMethodNotAllowed(res, ['POST']);
    return;
  }

  res.setHeader('Set-Cookie', clearAdminSessionCookie());
  sendJson(res, 200, { ok: true });
}
