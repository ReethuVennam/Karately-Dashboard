/** ₹ amount, rounded, grouped Indian-style: inr(12345) -> "₹12,345" */
export const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

/** Plain grouped number, Indian-style: num(12345) -> "12,345" */
export const num = (n) => Number(n || 0).toLocaleString('en-IN');

/** Fixed-decimal quantity, tolerant of missing/null values: grams(2.4, 2) -> "2.40" */
export const grams = (n, decimals = 2) => Number(n || 0).toFixed(decimals);

/** KYC status -> badge variant */
export const KYC_BADGE_VARIANT = { verified: 'success', pending: 'warning', rejected: 'critical', incomplete: 'muted' };
export const kycBadgeVariant = (status) => KYC_BADGE_VARIANT[status] || 'muted';

/** Order/payment status -> badge variant (used on Orders + User detail order tables) */
export const PAYMENT_BADGE_VARIANT = { SUCCESS: 'success', FAILED: 'critical', PENDING: 'warning' };
export const ORDER_BADGE_VARIANT = { completed: 'success', failed: 'critical', pending: 'warning' };

/** order_type -> friendly label (used on Orders + User detail order tables) */
export const ORDER_TYPE_LABEL = { digital_purchase: 'Buy', digital_sell: 'Sell', physical_redemption: 'Redeem' };
