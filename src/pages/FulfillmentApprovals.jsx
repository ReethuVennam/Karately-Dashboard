import { useCallback, useEffect, useState } from 'react';
import { isRetryBuySuccess, listPendingRequests, retryBuy } from '../api/fulfillmentApi';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import OrderLookupModal from '../components/OrderLookupModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { inr } from '../utils/format';

const STATUS_BADGE = { PENDING: 'warning', APPROVED: 'info', PROCESSED: 'success', REJECTED: 'critical' };

function RetryBuyModal({ request, onClose, onDone }) {
  const showToast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await retryBuy(request);
      if (isRetryBuySuccess(res)) {
        showToast(`Gold purchase completed for ${request.customer_name || request.customer_mobile}`);
        onDone();
      } else {
        const msg =
          res?.message || res?.error || (res?.payload && typeof res.payload === 'string' ? res.payload : null);
        setError(msg || 'Retry buy failed — the purchase was not completed');
      }
    } catch (err) {
      setError(err?.message || 'Retry buy failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Retry gold buy" onClose={onClose}>
      <div className="kv-row">
        <span className="k">Customer</span>
        <span className="v">
          {request.customer_name || '—'} &middot; {request.customer_mobile || '—'}
        </span>
      </div>
      <div className="kv-row">
        <span className="k">Order</span>
        <span className="v">{request.merchant_order_id || request.sabbpe_order_id || '—'}</span>
      </div>
      <div className="kv-row">
        <span className="k">Amount</span>
        <span className="v">{inr(request.order_amount)}</span>
      </div>
      <div className="kv-row">
        <span className="k">Metal</span>
        <span className="v">{request.metal_type || 'gold'}</span>
      </div>
      <div className="kv-row">
        <span className="k">Level 1 note</span>
        <span className="v">{request.level1_note || '—'}</span>
      </div>
      {request.retry_count > 0 ? (
        <div className="kv-row">
          <span className="k">Already retried</span>
          <span className="v">
            {request.retry_count}&times; &middot; last {request.last_retry_at || '—'}
          </span>
        </div>
      ) : null}

      {error ? <div className="login-err" style={{ marginTop: 12 }}>{error}</div> : null}

      <div className="login-hint" style={{ marginTop: 10 }}>
        This fetches the live rate, then calls the retry-buy API which purchases the metal at that rate — it moves real money and gold.
      </div>

      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose} disabled={submitting}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>
          {submitting ? 'Retrying…' : 'Retry buy'}
        </button>
      </div>
    </Modal>
  );
}

export default function FulfillmentApprovals() {
  const { currentAdmin } = useAuth();
  const adminId = currentAdmin?.id;
  const showToast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [lookupId, setLookupId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPendingRequests(adminId);
      setRequests(res.requests || []);
    } catch (err) {
      showToast(err?.message || 'Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  }, [adminId, showToast]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Fulfillment approvals</h2>
          <div className="desc">Level 1 retry requests awaiting a Level 2 admin to buy the gold — Level 1 cannot execute these themselves</div>
        </div>
        <button className="btn btn-sm" type="button" onClick={reload} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Requested</th>
                <th>Requested by</th>
                <th>Customer</th>
                <th>Order</th>
                <th className="num">Amount ₹</th>
                <th>Metal</th>
                <th>Note</th>
                <th>Status</th>
                <th>Retries</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} style={{ cursor: 'default' }}>
                  <td className="dim">{r.created_at}</td>
                  <td>{r.created_by_name || '—'}</td>
                  <td>
                    {r.customer_name}
                    <br />
                    <span className="mono faint">{r.customer_mobile}</span>
                  </td>
                  <td className="id-cell">{r.merchant_order_id || r.sabbpe_order_id}</td>
                  <td className="num">{inr(r.order_amount)}</td>
                  <td>{r.metal_type}</td>
                  <td className="addr-cell faint" title={r.level1_note || ''}>
                    {r.level1_note || '—'}
                  </td>
                  <td>
                    <Badge variant={STATUS_BADGE[r.status] || 'muted'}>{r.status}</Badge>
                  </td>
                  <td>{r.retry_count > 0 ? `${r.retry_count}× · ${r.last_retry_at || ''}` : '—'}</td>
                  <td>
                    <button className="btn btn-sm" type="button" onClick={() => setLookupId(r.customer_id)}>
                      Details
                    </button>
                  </td>
                  <td>
                    {r.status === 'PENDING' || r.status === 'APPROVED' ? (
                      <button className="btn btn-sm btn-primary" type="button" onClick={() => setActiveRequest(r)}>
                        Retry buy
                      </button>
                    ) : (
                      <span className="faint">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && requests.length === 0 ? <div className="empty-note">No pending retry requests right now.</div> : null}
      </div>

      {activeRequest ? (
        <RetryBuyModal
          request={activeRequest}
          onClose={() => setActiveRequest(null)}
          onDone={() => {
            setActiveRequest(null);
            reload();
          }}
        />
      ) : null}

      {lookupId ? (
        <OrderLookupModal adminId={adminId} uniqueId={lookupId} onClose={() => setLookupId(null)} />
      ) : null}
    </section>
  );
}
