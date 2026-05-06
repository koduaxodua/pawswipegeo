import { createClient } from '@supabase/supabase-js';
import { createHmac, pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const ADMIN_COOKIE = 'mipove_admin';
const SESSION_TTL_SECONDS = 60 * 60 * 24;

export type ApiRequest = IncomingMessage & {
  method?: string;
  body?: unknown;
};

export type ApiResponse = ServerResponse & {
  status?: (code: number) => ApiResponse;
  json?: (body: unknown) => void;
};

export class AdminAuthError extends Error {
  status = 401;
}

function base64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(input: string): Buffer {
  const padded = input + '='.repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function sign(value: string, secret: string): string {
  return base64Url(createHmac('sha256', secret).update(value).digest());
}

function getAdminSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('Admin session secret is not configured');
  }
  return secret;
}

export function createAdminSessionCookie(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64Url(JSON.stringify({ sub: 'admin', iat: now, exp: now + SESSION_TTL_SECONDS }));
  const signature = sign(payload, getAdminSecret());
  const token = `v1.${payload}.${signature}`;
  return `${ADMIN_COOKIE}=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearAdminSessionCookie(): string {
  return `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

function parseCookies(req: ApiRequest): Record<string, string> {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const index = part.indexOf('=');
        if (index === -1) return [part, ''];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

export function requireAdmin(req: ApiRequest): void {
  const token = parseCookies(req)[ADMIN_COOKIE];
  if (!token) throw new AdminAuthError('Unauthorized');

  const [version, payload, signature] = token.split('.');
  if (version !== 'v1' || !payload || !signature) throw new AdminAuthError('Unauthorized');

  const expected = sign(payload, getAdminSecret());
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    throw new AdminAuthError('Unauthorized');
  }

  const decoded = JSON.parse(fromBase64Url(payload).toString('utf8')) as { sub?: string; exp?: number };
  if (decoded.sub !== 'admin' || !decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new AdminAuthError('Unauthorized');
  }
}

function safeEqualHex(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, 'hex');
  const bBuffer = Buffer.from(b, 'hex');
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export function verifyPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH || '';
  const [algorithm, iterationsRaw, salt, expectedHash] = stored.split('$');

  if (algorithm !== 'pbkdf2_sha256' || !iterationsRaw || !salt || !expectedHash) {
    return false;
  }

  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations < 100000) return false;

  const actualHash = pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
  return safeEqualHex(actualHash, expectedHash);
}

export async function readJson<T = Record<string, unknown>>(req: ApiRequest): Promise<T> {
  if (req.body && typeof req.body === 'object') return req.body as T;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {} as T;
  return JSON.parse(raw) as T;
}

export function sendJson(res: ApiResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export function sendMethodNotAllowed(res: ApiResponse, methods: string[]): void {
  res.setHeader('Allow', methods.join(', '));
  sendJson(res, 405, { error: 'method_not_allowed' });
}

export function getServiceSupabase() {
  const { url, serviceRoleKey } = getSupabaseAdminConfig();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseAdminConfig() {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL)
    ?? normalizeSupabaseUrl(process.env.VITE_SUPABASE_URL);
  const serviceRoleKey = normalizeServiceRoleKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase admin client is not configured');
  }

  return { url, serviceRoleKey };
}

export function normalizeSupabaseUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return undefined;
  const trimmed = rawUrl.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return undefined;

  try {
    const url = new URL(trimmed);
    if (!url.hostname.endsWith('.supabase.co')) return undefined;
    return url.origin;
  } catch {
    const stripped = trimmed.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    try {
      const url = new URL(stripped);
      return url.hostname.endsWith('.supabase.co') ? url.origin : undefined;
    } catch {
      return undefined;
    }
  }
}

function normalizeServiceRoleKey(rawSecret: string | undefined): string | undefined {
  if (!rawSecret) return undefined;
  const trimmed = rawSecret.trim().replace(/^['"]|['"]$/g, '').replace(/\s+/g, '');
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return undefined;
  if (!trimmed.startsWith('sb_secret_') && !trimmed.startsWith('eyJ')) {
    throw new Error('Supabase service role key has unexpected format');
  }
  return trimmed;
}

export async function supabaseRest<T>(
  path: string,
  init: RequestInit = {},
): Promise<{ data: T | null; error: { status: number; message: string } | null; count: number | null }> {
  const { url, serviceRoleKey } = getSupabaseAdminConfig();
  const target = `${url}/rest/v1/${path.replace(/^\/+/, '')}`;
  const headers = new Headers(init.headers);
  headers.set('apikey', serviceRoleKey);
  headers.set('Authorization', `Bearer ${serviceRoleKey}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(target, { ...init, headers });
  } catch (error) {
    const cause = error instanceof Error && 'cause' in error
      ? String((error as Error & { cause?: unknown }).cause)
      : undefined;
    throw new Error(cause ? `Supabase REST fetch failed: ${cause}` : 'Supabase REST fetch failed');
  }

  const text = await response.text();
  const count = parseContentRangeCount(response.headers.get('content-range'));

  if (!response.ok) {
    let message = text || response.statusText;
    try {
      const parsed = JSON.parse(text) as { message?: string; error?: string };
      message = parsed.message || parsed.error || message;
    } catch {
      // keep raw text
    }
    return { data: null, error: { status: response.status, message }, count };
  }

  if (!text) {
    return { data: null, error: null, count };
  }

  return { data: JSON.parse(text) as T, error: null, count };
}

function parseContentRangeCount(value: string | null): number | null {
  if (!value) return null;
  const match = value.match(/\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
