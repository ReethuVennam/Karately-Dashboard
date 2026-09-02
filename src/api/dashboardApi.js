/* ==========================================================================
   DASHBOARD API — replacement for mockApi.js. Hits the real
   /api/v1/admin/dashboard/... endpoints (see
   Karatly_Dashboard.postman_collection.json). Function names/signatures are
   kept close to the old apiOverview/apiOrdersSummary/apiRecentTransactions/
   apiUsers/apiUserDetail so the page-level diffs stay small.
   ========================================================================== */

import { apiGet } from './client';

/** GET /overview?days= -> { kpis, daily } */
export async function getOverview(days) {
  return apiGet('/api/v1/admin/dashboard/overview', { params: { days } });
}

/** GET /orders-summary?days= -> flat KPI object */
export async function getOrdersSummary(days) {
  return apiGet('/api/v1/admin/dashboard/orders-summary', { params: { days } });
}

/** GET /recent-transactions?days=&limit=&status= -> { transactions } */
export async function getRecentTransactions(days, limit, status) {
  return apiGet('/api/v1/admin/dashboard/recent-transactions', {
    params: { days, limit, status: status || 'ALL' },
  });
}

/** GET /users?search=&kyc= -> { users } */
export async function getUsers(search, kyc) {
  return apiGet('/api/v1/admin/dashboard/users', { params: { search: search || '', kyc: kyc || '' } });
}

/** GET /users/{clientId} -> { profile, orders, banks, addresses } */
export async function getUserDetail(clientId) {
  return apiGet(`/api/v1/admin/dashboard/users/${encodeURIComponent(clientId)}`);
}

/** GET /order-audit?merchantTransactionId= -> { audit: [...] } */
export async function getOrderAudit(merchantTransactionId) {
  return apiGet('/api/v1/admin/dashboard/order-audit', { params: { merchantTransactionId } });
}
