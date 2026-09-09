import { useState } from 'react';
import { requestRetry } from '../api/fulfillmentApi';
import { useToast } from '../context/ToastContext';

/**
 * Level 1's one-click Retry: fires POST /fulfillment/create immediately, no
 * confirmation modal, and tracks which orders were sent this session so
 * their button can flip to "Request sent" instead of firing twice.
 *
 * That tracking is client-side only — there's no endpoint to ask "does
 * this order already have a pending request" — so it resets on reload.
 * Once Level 2 actually processes the request, the row's own
 * gold_received flag flips on the next list refresh and FulfillmentStatus
 * shows "Received" regardless of this local state.
 */
export function useInlineRetry() {
  const showToast = useToast();
  const [sendingId, setSendingId] = useState(null);
  const [sentIds, setSentIds] = useState(() => new Set());

  const handleRetry = async (row) => {
    const id = row.sabbpe_order_id;
    setSendingId(id);
    try {
      const res = await requestRetry(row);
      if (!res?.success) throw new Error(res?.message || 'Failed to send request');
      setSentIds((prev) => new Set(prev).add(id));
      showToast(res.message || 'Request sent to Level 2 admin');
    } catch (err) {
      showToast(err?.message || 'Failed to send request');
    } finally {
      setSendingId(null);
    }
  };

  return {
    handleRetry,
    isSending: (row) => sendingId === row.sabbpe_order_id,
    isSent: (row) => sentIds.has(row.sabbpe_order_id),
  };
}
