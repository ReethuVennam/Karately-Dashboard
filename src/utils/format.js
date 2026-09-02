/** ₹ amount, rounded, grouped Indian-style: inr(12345) -> "₹12,345" */
export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

/** Plain grouped number, Indian-style: num(12345) -> "12,345" */
export const num = (n) => Number(n).toLocaleString('en-IN');

/** KYC status -> badge variant */
export const KYC_BADGE_VARIANT = { verified: 'success', pending: 'warning', rejected: 'critical', incomplete: 'muted' };
export const kycBadgeVariant = (status) => KYC_BADGE_VARIANT[status] || 'muted';

/** Order/payment status -> badge variant (used on Orders + User detail order tables) */
export const PAYMENT_BADGE_VARIANT = { SUCCESS: 'success', FAILED: 'critical', PENDING: 'warning' };
export const ORDER_BADGE_VARIANT = { completed: 'success', failed: 'critical', pending: 'warning' };
