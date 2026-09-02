/* ==========================================================================
   ALERTS API — thin wrappers over client.js hitting
   /api/v1/admin/alerts/... (reconciliation alert scanner).
   ========================================================================== */

import { apiGet, apiPost } from './client';

/** GET /?days=&category=&severity=&status= -> { alerts: [...] }.
 *  status: open | acknowledged | resolved | ALL (backend defaults to 'open'
 *  when omitted — pass it through as-is, empty string included). */
export async function listAlerts({ days, category, severity, status } = {}) {
  return apiGet('/api/v1/admin/alerts', {
    params: { days, category: category || '', severity: severity || '', status: status || 'open' },
  });
}

/** GET /summary -> { total_open, critical, high_count, medium_count, acknowledged, resolved_total } */
export async function getAlertsSummary() {
  return apiGet('/api/v1/admin/alerts/summary');
}

/** POST /refresh -> triggers a manual re-scan, returns a per-category/severity
 *  count summary (not the same shape as listAlerts) — callers should just
 *  re-fetch the list + summary afterward rather than render this directly. */
export async function refreshAlerts() {
  return apiPost('/api/v1/admin/alerts/refresh');
}

/** POST /{id}/acknowledge -> { success, message } */
export async function acknowledgeAlert(id) {
  return apiPost(`/api/v1/admin/alerts/${encodeURIComponent(id)}/acknowledge`);
}

/** POST /{id}/resolve — optional body { note } -> { success, message } */
export async function resolveAlert(id, note) {
  return apiPost(`/api/v1/admin/alerts/${encodeURIComponent(id)}/resolve`, note ? { note } : undefined);
}
