import Badge from './Badge';
import { PAYMENT_BADGE_VARIANT } from '../utils/format';

/**
 * Payment + Fulfillment badge cells plus the Retry action, shared by the
 * Fulfillment Issues table and the User detail Payments tab — both render
 * cashfree_payments-shaped rows carrying a gold_received flag. Renders as
 * three <td>s; the caller supplies the row's leading columns.
 *
 * Retry is only offered when money actually landed (payment_status ===
 * 'SUCCESS') but gold wasn't credited. A failed or never-completed payment
 * has nothing to "retry" — there's no captured payment to fulfil against,
 * so a manual Augmont buy there would hand out gold nobody paid for.
 *
 * Clicking Retry fires immediately (see hooks/useInlineRetry) — there's no
 * confirmation step for Level 1, since this only files a request; the
 * caller passes `sending`/`sent` (from that hook) to reflect the button's
 * state in place instead of navigating away or opening a modal.
 */
export default function FulfillmentStatus({ row, onRetry, sending, sent }) {
  const goldOk = !!row.gold_received;
  const paymentCaptured = row.payment_status === 'SUCCESS';
  const canRetry = !goldOk && paymentCaptured;

  return (
    <>
      <td>
        <Badge variant={PAYMENT_BADGE_VARIANT[row.payment_status] || 'muted'}>{row.payment_status}</Badge>
      </td>
      <td>
        {goldOk ? (
          <Badge variant="success">Received</Badge>
        ) : row.fulfillment_status ? (
          <Badge variant="critical" title={row.fulfillment_status}>
            Failed
          </Badge>
        ) : (
          <Badge variant="warning">Never ran</Badge>
        )}
      </td>
      <td>
        {!canRetry ? (
          <span className="faint" title={goldOk ? '' : 'Payment was not captured — nothing to retry'}>
            {goldOk ? '—' : 'No payment'}
          </span>
        ) : sent ? (
          <Badge variant="info">Request sent</Badge>
        ) : (
          <button className="btn btn-sm btn-primary" type="button" onClick={() => onRetry(row)} disabled={sending}>
            {sending ? 'Sending…' : 'Retry'}
          </button>
        )}
      </td>
    </>
  );
}
