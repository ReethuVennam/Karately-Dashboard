/* ==========================================================================
   GOLD FULFILLMENT RETRY — /api/v1/admin/fulfillment/... (two-level approval
   for retrying a paid-but-unfulfilled gold purchase). Level 1 can only file
   a request (requestRetry, fired one-click from hooks/useInlineRetry — no
   confirmation step); the actual Augmont buy only happens behind retryBuy,
   which the backend restricts to Level 2 — see pages/FulfillmentApprovals.jsx
   for that queue + execute UI.
   ========================================================================== */

import { getLiveRates } from './dashboardApi';
import { apiGet, apiPost } from './client';

const DEFAULT_LEVEL1_NOTE = 'User paid but gold not received';

/** POST /create — Level 1. Files a request; does not touch Augmont.
 *  -> { success, request_id, message } */
export async function createFulfillmentRequest(payload) {
  return apiPost('/api/v1/admin/fulfillment/create', payload);
}

/**
 * One-click version of the above for Level 1's Retry button: fetches a live
 * rate and files the request immediately, no confirmation step.
 *
 * Always locks metalType to 'gold' — neither POST /search nor
 * POST /unfulfilled-cashfree report which metal the original stuck order
 * was for, so there's nothing to select or infer from. Wrong for a silver
 * order; fix properly once the backend adds a metal_type field to those
 * responses.
 */
export async function requestRetry(row) {
  const ratesRes = await getLiveRates();
  const data = ratesRes?.rates?.payload?.result?.data || {};
  const rate = data.rates?.gBuy;
  const blockId = data.blockId;
  if (!rate || !blockId) {
    throw new Error('Live rate unavailable — try again in a moment');
  }
  return createFulfillmentRequest({
    sabbpeOrderId: row.sabbpe_order_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerMobile: row.customer_mobile,
    orderAmount: row.order_amount,
    lockPrice: String(rate),
    blockId,
    metalType: 'gold',
    merchantOrderId: row.merchant_order_id,
    level1Note: DEFAULT_LEVEL1_NOTE,
  });
}

/** POST /{id}/retry-buy — Level 2 only. Backend loads the stored
 *  lock_price/block_id/metal_type from the request and calls Sabbpegold's
 *  buy/create itself — nothing for the frontend to fetch beforehand.
 *  -> { success, request, sabbpe_order_id, buy_response } */
export async function retryBuy(id, note) {
  return apiPost(`/api/v1/admin/fulfillment/${encodeURIComponent(id)}/retry-buy`, { note });
}

/** GET /pending — Level 2 only. -> { requests: [...] } */
export async function listPendingRequests() {
  return apiGet('/api/v1/admin/fulfillment/pending');
}
