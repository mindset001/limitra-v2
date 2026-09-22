import { API_BASE_URL } from './config';
import { getToken, clearTokens } from '@/lib/auth';

// `errors` is the field-level validation payload from an ErrorResponse (nullable).
export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Generic JSON fetch wrapper used by every endpoint module in lib/api/.
// Every JSON response is enveloped as SuccessResponse { success, message, data }
// or ErrorResponse { success, message, errors } — this unwraps `data` on success
// and throws ApiError on failure. `auth: false` skips the Authorization header
// for public endpoints (signup/login/etc). Auth is pure Bearer JWT (no cookies/
// sessions — the API serves CORS with Access-Control-Allow-Origin: *, which is
// incompatible with credentialed requests anyway).
export async function apiFetch(path, { method = 'GET', body, params, auth = true, headers = {} } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    });
  }

  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : await res.text();

  const ok = res.ok && (!isJson || payload?.success !== false);
  if (!ok) {
    if (res.status === 401) clearTokens();
    throw new ApiError(payload?.message || res.statusText, res.status, payload?.errors);
  }
  return isJson ? payload?.data : payload;
}
