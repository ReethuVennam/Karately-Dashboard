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
 *  wrapper (merchantId + request{...}) plus requestId/adminId so it can mark
 *  the Level 1 request PROCESSED/REJECTED once the buy resolves — without
 *  these, createBuyOrder only updates the Augmont/Cashfree side and the
 *  request stays stuck showing PENDING forever, even after a real success.
 *  -> { status, payload } — check isRetryBuySuccess(). */
export async function retryBuy(requestRow, adminId) {
  const rate = await fetchLiveRate();

  const metalType = requestRow.metal_type || 'gold';
  const lockPriceRaw = metalType === 'silver' ? rate.rates.sBuy : rate.rates.gBuy;
  if (lockPriceRaw == null) {
    throw new Error(`Live ${metalType} buy rate unavailable — try again in a moment`);
  }

  const merchantTransactionId = requestRow.merchant_order_id || requestRow.sabbpe_order_id;
  const body = {
    requestId: requestRow.id,
    adminId,
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

/** On failure, /retry-buy's `message` is the backend's raw HTTP-client dump
 *  of the downstream Augmont call, e.g.
 *  `400 400 on POST request for "https://.../orders/buy/create": "{\"message\":\"User must be created before calling this API\",...}"`.
 *  Pull just the Augmont error text out of that instead of showing the dump. */
function extractBuyErrorMessage(raw) {
  if (!raw || typeof raw !== 'string') return raw;
  const match = raw.match(/"message"\s*:\s*"([^"]*)"/);
  return match ? match[1] : raw;
}

/** Known Augmont error strings, reworded for an admin who isn't familiar
 *  with Augmont's API contract. These are expected/handled business states
 *  (e.g. customer not yet onboarded) rather than unexpected failures — shown
 *  as a warning in the UI instead of a hard error (see isKnownBuyIssue). */
const FRIENDLY_BUY_ERRORS = {
  'User must be created before calling this API':
    "This customer doesn't have an Augmont account yet (no uniqueId on file) — the user must be onboarded with Augmont before gold can be purchased for them.",
};

/** Turn a /retry-buy failure message into something safe to show an admin. */
export function friendlyBuyError(raw) {
  const msg = extractBuyErrorMessage(raw);
  return FRIENDLY_BUY_ERRORS[msg] || msg;
}

/** True when the raw failure message is one of the known/expected Augmont
 *  business-state errors above, rather than a genuine unexpected failure. */
export function isKnownBuyIssue(raw) {
  const msg = extractBuyErrorMessage(raw);
  return Object.prototype.hasOwnProperty.call(FRIENDLY_BUY_ERRORS, msg);
}

/** POST /pending — Level 2 only. -> { requests: [...] } */
export async function listPendingRequests(adminId) {
  return apiPost('/api/v1/admin/fulfillment/pending', { adminId });
}
