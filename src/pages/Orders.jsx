import { useEffect, useState } from 'react';
import { getOrdersSummary, getRecentTransactions } from '../api/dashboardApi';
import Badge from '../components/Badge';
import KpiCard from '../components/KpiCard';
import { inr, num, ORDER_BADGE_VARIANT, ORDER_TYPE_LABEL, PAYMENT_BADGE_VARIANT } from '../utils/format';

const RANGE_CHIPS = [7, 30, 90];
const TXN_TABS = [
  { key: 'ALL', label: 'Recent' },
  { key: 'SUCCESS', label: 'Successful' },
  { key: 'FAILED', label: 'Failures' },
];

export default function Orders() {
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState('ALL');
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getOrdersSummary(days)
      .then((res) => {
        if (!cancelled) setSummary(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [days]);

  useEffect(() => {
    let cancelled = false;
    getRecentTransactions(days, 50, tab)
      .then((res) => {
        if (!cancelled) setTransactions(res.transactions || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [days, tab]);

  const s = summary;
  const kpiCards = s
    ? [
        { key: 'buy_count', bar: 'gold', label: 'Buy orders', value: num(s.buy_count) },
        { key: 'sell_count', bar: 'gold', label: 'Sell orders', value: num(s.sell_count) },
        { key: 'redeem_count', bar: 'silver', label: 'Redeem orders', value: num(s.redeem_count) },
        { key: 'total_orders', bar: 'info', label: 'Total orders', value: num(s.total_orders) },
        { key: 'order_success', bar: 'success', label: 'Successful', value: num(s.order_success) },
        { key: 'order_failed', bar: 'critical', label: 'Failed', value: num(s.order_failed) },
        { key: 'order_pending', bar: 'warning', label: 'Pending', value: num(s.order_pending) },
        { key: 'payment_paid', bar: 'success', label: 'Payment paid', value: num(s.payment_paid) },
        { key: 'payment_failed', bar: 'critical', label: 'Payment failed', value: num(s.payment_failed) },
        { key: 'payment_pending', bar: 'warning', label: 'Payment pending', value: num(s.payment_pending) },
        { key: 'augmont_purchased', bar: 'gold', label: 'Gold purchased', value: num(s.augmont_purchased) },
        { key: 'diamond_purchased', bar: 'diamond', label: 'Diamond purchased', value: num(s.diamond_purchased) },
        { key: 'paid_no_gold', bar: 'warning', extraClass: 'warn', label: '⚠️ Paid but no gold', value: num(s.paid_no_gold) },
        { key: 'total_collected', bar: 'gold', label: 'Total ₹ collected', value: inr(s.total_collected) },
      ]
    : [];

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Orders</h2>
          <div className="desc">Order counts, payment status and the underlying transactions</div>
        </div>
        <div className="chip-group">
          {RANGE_CHIPS.map((d) => (
            <span key={d} className={`chip${days === d ? ' active' : ''}`} onClick={() => setDays(d)}>
              {d}d
            </span>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        {kpiCards.map((c) => (
          <KpiCard key={c.key} bar={c.bar} label={c.label} value={c.value} extraClass={c.extraClass} />
        ))}
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <div className="panel-head" style={{ padding: '16px 16px 0' }}>
          <div>
            <h3>Transactions</h3>
            <div className="desc">Underlying orders behind the counts above</div>
          </div>
          <div className="tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
            {TXN_TABS.map((t) => (
              <div key={t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
              </div>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Type</th>
                <th>Metal</th>
                <th className="num">Amount ₹</th>
                <th className="num">Gold g</th>
                <th>Payment</th>
                <th>Order</th>
                <th>Gateway</th>
                <th>Augmont</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.order_id} style={{ cursor: 'default' }}>
                  <td className="dim">{t.order_date}</td>
                  <td>{t.client_name}</td>
                  <td className="mono">{t.client_mobile}</td>
                  <td>{ORDER_TYPE_LABEL[t.order_type] || t.order_type}</td>
                  <td>{t.metal_type}</td>
                  <td className="num">{inr(t.amount)}</td>
                  <td className="num">{t.augmont_quantity ? t.augmont_quantity : '—'}</td>
                  <td>
                    <Badge variant={PAYMENT_BADGE_VARIANT[t.payment_status] || 'muted'}>{t.payment_status}</Badge>
                  </td>
                  <td>
                    <Badge variant={ORDER_BADGE_VARIANT[t.order_status] || 'muted'}>{t.order_status}</Badge>
                  </td>
                  <td>
                    {t.payment_gateway}
                    {!t.augmont_txn_id ? (
                      <>
                        {' '}
                        <Badge variant="critical" title="Gold not purchased">
                          no gold
                        </Badge>
                      </>
                    ) : null}
                  </td>
                  <td className={`addr-cell ${t.augmont_error ? 'dim' : 'faint'}`} title={t.augmont_error || t.augmont_message || ''}>
                    {t.augmont_error ? '⚠️ ' + t.augmont_error : t.augmont_message || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 ? <div className="empty-note">No transactions in this window.</div> : null}
      </div>
    </section>
  );
}
