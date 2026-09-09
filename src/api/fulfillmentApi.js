/* ==========================================================================
   GOLD FULFILLMENT RETRY — /api/v1/admin/fulfillment/... (two-level approval
   for retrying a paid-but-unfulfilled gold purchase). Level 1 files a request
   via createRequest; Level 2 executes the actual buy via retryBuy.
   ========================================================================== */

import { apiPost } from './client';

/** Live-rate source. lockPrice (rates.gBuy / rates.sBuy) and blockId are a
 *  PAIR — both must come from the SAME response or Augmont rejects with
 *  422 "Invalid lock price" — so one fetch returns both. */
const LIVE_RATE_URL =
  (import.meta.env.VITE_UAT_BASE_URL || 'https://uatbckend.karatly.net').replace(/\/+$/, '') +
  '/api/v1/rates/live';

/** Fetch the live Augmont rate block once. -> { rates: { gBuy, sBuy }, blockId } */
async function fetchLiveRate() {
  const res = await fetch(LIVE_RATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON body — fall through to the generic error */
  }
  const data = json?.payload?.result?.data;
  if (!res.ok || !data?.rates || !data.blockId) {
    throw new Error(json?.message || 'Live rate unavailable — try again in a moment');
  }
  return data;
}

/** POST /create — Level 1. Files a request with just uniqueId;
 *  backend auto-fetches all order details.
 *  -> { success, request_id, request, message } */
export async function createRequest(adminId, uniqueId, level1Note) {
  return apiPost('/api/v1/admin/fulfillment/create', {
    adminId,
    uniqueId,
    level1Note,
  });
}

/** POST /lookup-unique — Both levels. Looks up order details by uniqueId.
 *  -> { orders: [...] } */
export async function lookupUnique(adminId, uniqueId) {
  return apiPost('/api/v1/admin/fulfillment/lookup-unique', {
    adminId,
    uniqueId,
  });
}

/** POST /retry-buy — Level 2 only. The backend receives the full sabbpegold
 *  wrapper (merchantId + request{...}); the frontend must supply lockPrice +
 *  blockId from a SINGLE live-rates call and the rest from the pending
 *  request row. No adminId / note in this contract.
 *  -> { status, payload } — check isRetryBuySuccess(). */
export async function retryBuy(requestRow) {
  const rate = await fetchLiveRate();

  const metalType = requestRow.metal_type || 'gold';
  const lockPriceRaw = metalType === 'silver' ? rate.rates.sBuy : rate.rates.gBuy;
  if (lockPriceRaw == null) {
    throw new Error(`Live ${metalType} buy rate unavailable — try again in a moment`);
  }

  const merchantTransactionId = requestRow.merchant_order_id || requestRow.sabbpe_order_id;
  const body = {
    merchantId: merchantTransactionId,
    request: {
      lockPrice: String(lockPriceRaw),
      metalType,
      quantity: null,
      amount: Number(requestRow.order_amount).toFixed(2),
      merchantTransactionId,
      uniqueId: requestRow.customer_id,
      phoneNumber: requestRow.customer_mobile,
      blockId: rate.blockId,
      modeOfPayment: 'CASHFREE',
      mobileNumber: requestRow.customer_mobile,
    },
  };
  return apiPost('/api/v1/admin/fulfillment/retry-buy', body);
}

/** POST /retry-buy always answers HTTP 200 — the outcome lives in the body. */
export function isRetryBuySuccess(data) {
  return !!(data && (data.status === 'success' || data.payload?.statusCode === 200));
}

/** POST /pending — Level 2 only. -> { requests: [...] } */
export async function listPendingRequests(adminId) {
  return apiPost('/api/v1/admin/fulfillment/pending', { adminId });
}
