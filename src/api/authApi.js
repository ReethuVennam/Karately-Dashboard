/* ==========================================================================
   AUTH API — thin wrappers over client.js hitting
   /api/v1/admin/auth/... (see Karatly_Dashboard.postman_collection.json).
   ========================================================================== */

import { apiGet, apiPost, setSession } from './client';

/** POST /login — body { phoneNumber, password } -> { success, admin }.
 *  The backend no longer returns a token; adminId is sent in request
 *  bodies instead. Persists the admin to localStorage on success. */
export async function login(phoneNumber, password) {
  const data = await apiPost('/api/v1/admin/auth/login', { phoneNumber, password });
  if (data?.success === false) {
    throw new Error(data.message || 'Invalid phone number or password');
  }
  if (data?.admin) setSession(null, data.admin);
  return data;
}

/** POST /validate-token — bearer header only, no body. Response shape is
 *  unspecified by the backend; callers should treat any 2xx as "still
 *  valid" and use `admin` from the body when present. */
export async function validateToken() {
  return apiPost('/api/v1/admin/auth/validate-token');
}

/** POST /change-password — body { currentPassword, newPassword }, authed as self. */
export async function changePassword(currentPassword, newPassword) {
  return apiPost('/api/v1/admin/auth/change-password', { currentPassword, newPassword });
}

/** POST /reset-password — body { phoneNumber, newPassword }, super-admin only. */
export async function resetPassword(phoneNumber, newPassword) {
  return apiPost('/api/v1/admin/auth/reset-password', { phoneNumber, newPassword });
}

/** POST /create-admin — body { phoneNumber, fullName, email, password, isSuperAdmin }, super-admin only. */
export async function createAdmin({ phoneNumber, fullName, email, password, isSuperAdmin }) {
  return apiPost('/api/v1/admin/auth/create-admin', { phoneNumber, fullName, email, password, isSuperAdmin });
}

/** GET /admins — super-admin only. Response shape isn't specified, so this
 *  handles both a bare array and a { admins: [...] } wrapper. */
export async function listAdmins() {
  const json = await apiGet('/api/v1/admin/auth/admins');
  return Array.isArray(json) ? json : (json?.admins ?? []);
}
