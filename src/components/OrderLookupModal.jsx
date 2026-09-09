import { useEffect, useState } from 'react';
import { lookupUnique } from '../api/fulfillmentApi';
import Badge from './Badge';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';
import { inr } from '../utils/format';

const STATUS_BADGE = { SUCCESS: 'success', FAILED: 'critical', PENDING: 'warning', PAID: 'success' };

/**
 * Modal that looks up order details by uniqueId (customer_id).
 * Used by both Level 1 (before sending request) and Level 2 (to review
 * failure reasons). Fetches data on mount via POST /fulfillment/lookup-unique.
 */
export default function OrderLookupModal({ adminId, uniqueId, onClose }) {
  const showToast = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchDetails() {
      setLoading(true);
      setError(null);
      try {
        const res = await lookupUnique(adminId, uniqueId);
        if (cancelled) return;
        setOrders(res?.orders || []);
      } catch (err) {
        if (cancelled) return;
        setError(err?.message || 'Failed to load order details');
        showToast(err?.message || 'Failed to load order details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDetails();
    return () => {
      cancelled = true;
    };
  }, [adminId, uniqueId, showToast]);

  return (
    <Modal title="Order details" onClose={onClose} wide>
      {loading ? (
        <div className="dim" style={{ padding: '20px 0' }}>Loading order details…</div>
      ) : error ? (
        <div className="login-err">{error}</div>
      ) : orders.length === 0 ? (
        <div className="dim" style={{ padding: '20px 0' }}>No orders found for this customer.</div>
      ) : (
        orders.map((o) => (
          <div key={o.sabbpe_order_id} style={{ marginBottom: 20 }}>
            <div className="kv-row">
              <span className="k">Customer</span>
              <span className="v">{o.customer_name || '—'} · {o.customer_mobile || '—'}</span>
            </div>
            <div className="kv-row">
              <span className="k">Customer ID</span>
              <span className="v mono">{o.customer_id || '—'}</span>
            </div>
            <div className="kv-row">
              <span className="k">Order ID</span>
              <span className="v">{o.merchant_order_id || o.sabbpe_order_id || '—'}</span>
            </div>
            <div className="kv-row">
              <span className="k">Amount</span>
              <span className="v">{inr(o.order_amount)}</span>
            </div>
            <div className="kv-row">
              <span className="k">Metal</span>
              <span className="v">{o.metal_type || '—'}</span>
            </div>
            <div className="kv-row">
              <span className="k">Flow type</span>
              <span className="v">{o.flow_type || '—'}</span>
            </div>
            <div className="kv-row">
              <span className="k">Lock price</span>
              <span className="v">{o.lock_price ? inr(o.lock_price) + ' / g' : '—'}</span>
            </div>
            <div className="kv-row">
              <span className="k">Block ID</span>
              <span className="v mono">{o.block_id || '—'}</span>
            </div>
            <div className="kv-row">
              <span className="k">Payment status</span>
              <span className="v">
                <Badge variant={STATUS_BADGE[o.payment_status] || 'muted'}>{o.payment_status || '—'}</Badge>
              </span>
            </div>
            <div className="kv-row">
              <span className="k">Order status</span>
              <span className="v">
                <Badge variant={STATUS_BADGE[o.order_status] || 'muted'}>{o.order_status || '—'}</Badge>
              </span>
            </div>
            <div className="kv-row">
              <span className="k">Fulfillment</span>
              <span className="v">
                {o.fulfillment_status ? (
                  <Badge variant="critical">{o.fulfillment_status}</Badge>
                ) : (
                  <Badge variant="warning">Never ran</Badge>
                )}
              </span>
            </div>
            {o.augmont_message ? (
              <div className="kv-row">
                <span className="k">Augmont message</span>
                <span className="v">{o.augmont_message}</span>
              </div>
            ) : null}
            {o.provider_response_payload ? (
              <div className="kv-row">
                <span className="k">Provider response</span>
                <span className="v addr-cell" title={o.provider_response_payload}>
                  {o.provider_response_payload}
                </span>
              </div>
            ) : null}
            <div className="kv-row">
              <span className="k">Payment time</span>
              <span className="v">{o.payment_time || '—'}</span>
            </div>
            <div className="kv-row">
              <span className="k">Created</span>
              <span className="v">{o.created_at || '—'}</span>
            </div>
          </div>
        ))
      )}

      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
