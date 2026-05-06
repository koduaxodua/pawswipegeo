import type { ApiRequest, ApiResponse } from '../_admin.js';
import { createAdminSessionCookie, readJson, sendJson, sendMethodNotAllowed, verifyPassword } from '../_admin.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    sendMethodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const body = await readJson<{ password?: string }>(req);
    if (!body.password || !verifyPassword(body.password)) {
      sendJson(res, 401, { error: 'invalid_password' });
      return;
    }

    res.setHeader('Set-Cookie', createAdminSessionCookie());
    sendJson(res, 200, { ok: true });
  } catch {
    sendJson(res, 400, { error: 'invalid_request' });
  }
}
