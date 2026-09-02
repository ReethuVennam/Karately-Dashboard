/* ==========================================================================
   API CLIENT — thin fetch wrapper shared by authApi.js and dashboardApi.js.
   Reads the backend base URL from VITE_API_BASE_URL (see .env.example),
   attaches the bearer token from localStorage, and normalizes errors so
   callers can surface a useful message. On a 401 it clears the stored
   session and notifies whoever registered via setUnauthorizedHandler()
   (AuthContext) — kept as a callback instead of importing AuthContext
   directly to avoid a circular import between the API layer and context.
   ========================================================================== */

const DEFAULT_BASE_URL = 'http://localhost:8082';
export const BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');

const TOKEN_KEY = 'karatly_admin_token';
const ADMIN_KEY = 'karatly_admin_user';

let unauthorizedHandler = null;

/** Registered by AuthContext on mount so client.js can trigger a logout
 *  without importing the context module. */
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredAdmin() {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(token, admin) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  } catch {
    /* localStorage unavailable (private mode, etc.) — session just won't persist */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  } catch {
    /* ignore */
  }
}

function buildUrl(path, params) {
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
}

async function handleResponse(res) {
  if (res.status === 401) {
    clearSession();
    if (unauthorizedHandler) unauthorizedHandler();
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body?.message || body?.error || message;
    } catch {
      /* non-JSON error body — keep the generic message */
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet(path, { params } = {}) {
  const res = await fetch(buildUrl(path, params), {
    method: 'GET',
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function apiPost(path, body) {
  const headers = { ...authHeaders() };
  const init = { method: 'POST', headers };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetch(buildUrl(path), init);
  return handleResponse(res);
}
