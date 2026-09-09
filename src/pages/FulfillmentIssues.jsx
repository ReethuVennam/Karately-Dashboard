import { useCallback, useEffect, useState } from 'react';
import { getUnfulfilledCashfree } from '../api/dashboardApi';
import FulfillmentStatus from '../components/FulfillmentStatus';
import { useToast } from '../context/ToastContext';
import { useInlineRetry } from '../hooks/useInlineRetry';
import { inr } from '../utils/format';

const DAYS_CHIPS = [30, 90];
const STATUS_CHIPS = [
  { key: 'ALL', label: 'All' },
  { key: 'FAILED', label: 'Buy failed' },
  { key: 'PENDING', label: 'Buy never ran' },
];

export default function FulfillmentIssues() {
  const showToast = useToast();
  const [days, setDays] = useState(90);
  const [status, setStatus] = useState('ALL');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handleRetry, isSending, isSent } = useInlineRetry();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUnfulfilledCashfree({ days, status });
      setOrders(res.orders || []);
    } catch (err) {
      showToast(err?.message || 'Failed to load unfulfilled orders');
    } finally {
      setLoading(false);
    }
  }, [days, status, showToast]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Fulfillment issues</h2>
          <div className="desc">Cashfree payment succeeded but the Augmont gold purchase never completed — retry it from here</div>
        </div>
        <div className="flex gap-8">
          <div className="chip-group">
            {STATUS_CHIPS.map((c) => (
              <span key={c.key} className={`chip${status === c.key ? ' active' : ''}`} onClick={() => setStatus(c.key)}>
                {c.label}
              </span>
            ))}
          </div>
          <div className="chip-group">
            {DAYS_CHIPS.map((d) => (
              <span key={d} className={`chip${days === d ? ' active' : ''}`} onClick={() => setDays(d)}>
                {d}d
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Order</th>
                <th className="num">Amount ₹</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.sabbpe_order_id} style={{ cursor: 'default' }}>
                  <td className="dim">{o.created_at}</td>
                  <td>{o.customer_name}</td>
                  <td className="mono">{o.customer_mobile}</td>
                  <td className="id-cell">{o.merchant_order_id || o.sabbpe_order_id}</td>
                  <td className="num">{inr(o.order_amount)}</td>
                  <FulfillmentStatus row={o} onRetry={handleRetry} sending={isSending(o)} sent={isSent(o)} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && orders.length === 0 ? (
          <div className="empty-note">Nothing stuck right now — every paid order has been fulfilled.</div>
        ) : null}
      </div>
    </section>
  );
}
