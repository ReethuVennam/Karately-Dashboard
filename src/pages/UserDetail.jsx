import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserDetail, searchClients } from '../api/dashboardApi';
import Badge from '../components/Badge';
import FulfillmentStatus from '../components/FulfillmentStatus';
import YesNo from '../components/YesNo';
import { useToast } from '../context/ToastContext';
import { useInlineRetry } from '../hooks/useInlineRetry';
import { inr, kycBadgeVariant, ORDER_BADGE_VARIANT, ORDER_TYPE_LABEL } from '../utils/format';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'orders', label: 'Orders' },
  { key: 'payments', label: 'Payments' },
  { key: 'banks', label: 'Banks' },
  { key: 'addresses', label: 'Addresses' },
];

export default function UserDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('profile');
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const { handleRetry, isSending, isSent } = useInlineRetry();

  useEffect(() => {
    let cancelled = false;
    setTab('profile');
    getUserDetail(clientId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData({ profile: null, orders: [], banks: [], addresses: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  // Cashfree payments (with the gold_received / Retry signal) live behind
  // POST /search, keyed by mobile — a different call from the orders tab's
  // GET /users/{id}, so they're fetched separately once the profile resolves.
  const mobile = data?.profile?.mobile;

  const reloadPayments = (mobileNumber) => {
    setPaymentsLoading(true);
    searchClients(mobileNumber)
      .then((res) => setPayments(res.cashfree_payments || []))
      .catch((err) => showToast(err?.message || 'Failed to load payments'))
      .finally(() => setPaymentsLoading(false));
  };

  useEffect(() => {
    if (mobile) reloadPayments(mobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile]);

  if (!data || !data.profile) {
    return (
      <section>
        <div className="back-link" onClick={() => navigate('/users')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to users
        </div>
        <div className="empty-note">User not found.</div>
      </section>
    );
  }

  const p = data.profile;
  const initials = p.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <section>
      <div className="back-link" onClick={() => navigate('/users')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to users
      </div>

      <div className="profile-head">
        <div className="av">{initials}</div>
        <div>
          <h2>{p.name}</h2>
          <div className="sub">
            {p.mobile} &middot; {p.email} &middot; <Badge variant={kycBadgeVariant(p.kyc_status)}>{p.kyc_status}</Badge>
          </div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <div key={t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </div>
        ))}
      </div>

      <div className={`tab-pane${tab === 'profile' ? ' active' : ''}`}>
        <div className="panel">
          <div className="kv-grid">
            <div className="kv">
              <div className="kv-label">Date of birth</div>
              <div className="kv-value">{p.date_of_birth || '—'}</div>
            </div>
            <div className="kv">
              <div className="kv-label">City / State</div>
              <div className="kv-value">
                {p.city || '—'}, {p.state || '—'} {p.pincode ? '- ' + p.pincode : ''}
              </div>
            </div>
            <div className="kv">
              <div className="kv-label">Primary address</div>
              <div className="kv-value">{p.primary_address || '—'}</div>
            </div>
            <div className="kv">
              <div className="kv-label">Registered</div>
              <div className="kv-value mono">{p.registered_at}</div>
            </div>
            <div className="kv">
              <div className="kv-label">KYC completed</div>
              <div className="kv-value mono">{p.kyc_completed_at || '—'}</div>
            </div>
            <div className="kv">
              <div className="kv-label">PAN verified</div>
              <div className="kv-value">
                <YesNo value={p.pan_verified} />
              </div>
            </div>
            <div className="kv">
              <div className="kv-label">Aadhaar verified</div>
              <div className="kv-value">
                <YesNo value={p.aadhaar_verified} />
              </div>
            </div>
            <div className="kv">
              <div className="kv-label">Bank verified</div>
              <div className="kv-value">
                <YesNo value={p.bank_verified} />
              </div>
            </div>
            <div className="kv">
              <div className="kv-label">PAN number</div>
              <div className="kv-value mono">{p.pan_number || '—'}</div>
            </div>
            <div className="kv">
              <div className="kv-label">PAN name</div>
              <div className="kv-value">{p.pan_name || '—'}</div>
            </div>
            <div className="kv">
              <div className="kv-label">Augmont ID</div>
              <div className="kv-value mono">{p.augmont_unique_id || '—'}</div>
            </div>
            <div className="kv">
              <div className="kv-label">Bank accounts on file</div>
              <div className="kv-value">{p.bank_accounts}</div>
            </div>
            <div className="kv">
              <div className="kv-label">Delivery addresses</div>
              <div className="kv-value">{p.delivery_addresses}</div>
            </div>
            <div className="kv">
              <div className="kv-label">Last activity</div>
              <div className="kv-value mono">{p.last_activity}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`tab-pane${tab === 'orders' ? ' active' : ''}`}>
        <div className="panel" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Type</th>
                  <th>Metal</th>
                  <th className="num">Amount ₹</th>
                  <th className="num">Qty (g)</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.length ? (
                  data.orders.map((o) => (
                    <tr key={o.order_id} style={{ cursor: 'default' }}>
                      <td className="id-cell">{o.order_reference}</td>
                      <td>{ORDER_TYPE_LABEL[o.order_type] || o.order_type.replace('_', ' ')}</td>
                      <td>{o.metal_type}</td>
                      <td className="num">{inr(o.amount)}</td>
                      <td className="num">{o.quantity}</td>
                      <td>
                        <Badge variant={ORDER_BADGE_VARIANT[o.order_status] || 'muted'}>{o.order_status}</Badge>
                      </td>
                      <td className="dim">
                        {o.order_date}
                        {o.tracking_number ? (
                          <>
                            <br />
                            <span className="mono faint">Tracking {o.tracking_number}</span>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="empty-note">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={`tab-pane${tab === 'payments' ? ' active' : ''}`}>
        <div className="panel" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order</th>
                  <th className="num">Amount ₹</th>
                  <th>Payment</th>
                  <th>Fulfillment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payments.length ? (
                  payments.map((pmt) => (
                    <tr key={pmt.sabbpe_order_id} style={{ cursor: 'default' }}>
                      <td className="dim">{pmt.created_at}</td>
                      <td className="id-cell">{pmt.merchant_order_id || pmt.sabbpe_order_id}</td>
                      <td className="num">{inr(pmt.order_amount)}</td>
                      <FulfillmentStatus row={pmt} onRetry={handleRetry} sending={isSending(pmt)} sent={isSent(pmt)} />
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-note">
                      {paymentsLoading ? 'Loading…' : 'No Cashfree payments on file.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={`tab-pane${tab === 'banks' ? ' active' : ''}`}>
        <div className="list-cards">
          {data.banks.length ? (
            data.banks.map((b) => (
              <div className="list-card" key={b.bank_account_id}>
                <div>
                  <div className="lc-title">
                    {b.account_holder_name} <span className="mono dim">{b.account_number}</span>
                  </div>
                  <div className="lc-sub">
                    IFSC {b.ifsc_code} &middot; {b.status} &middot; {b.provider || '—'} &middot; added {b.created_at || '—'}
                  </div>
                </div>
                {b.is_primary ? <Badge variant="info">Primary</Badge> : null}
              </div>
            ))
          ) : (
            <div className="empty-note">No bank accounts on file.</div>
          )}
        </div>
      </div>

      <div className={`tab-pane${tab === 'addresses' ? ' active' : ''}`}>
        <div className="list-cards">
          {data.addresses.length ? (
            data.addresses.map((a) => (
              <div className="list-card" key={a.address_id}>
                <div>
                  <div className="lc-title">{a.address_line}</div>
                  <div className="lc-sub">
                    {a.city}, {a.state} — {a.pincode}, {a.country || 'India'}
                  </div>
                </div>
                <div className="flex gap-6">
                  {a.is_primary ? <Badge variant="info">Primary</Badge> : null}
                  <Badge variant="muted">{a.address_source}</Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-note">No delivery addresses on file.</div>
          )}
        </div>
      </div>
    </section>
  );
}
