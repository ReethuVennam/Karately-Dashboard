import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisOverview, getRedeems, getSells } from '../api/dashboardApi';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';
import { inr, inrCompact, num } from '../utils/format';

/* Live MIS snapshot — mirrors the Karatly Master MIS report, now backed by
   GET /api/v1/admin/dashboard/mis-overview + /sells + /redeems instead of
   the static numbers the original HTML mockup hardcoded.
   Karatly Earn/Payout, Customer Earn/Burn and Profit are omitted: the
   backend returns those as null (no commission/wallet/cashback data exists
   in the sabbpekaratly DB) — see DashboardController#misOverview. There's
   also no backend endpoint for a "buy orders" list (only /sells and
   /redeems exist), so the second table below is Redeem orders, not Buy. */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PAYMENT_VARIANT = { SUCCESS: 'success', FAILED: 'critical', PENDING: 'warning' };
const ORDER_VARIANT = { completed: 'success', confirmed: 'success', failed: 'critical', pending: 'warning' };

function OrderTable({ rows, onRowClick, gramsLabel }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Mobile</th>
            <th>Metal</th>
            <th className="num">Amount ₹</th>
            <th className="num">{gramsLabel}</th>
            <th>Payment</th>
            <th>Order</th>
            <th>Gateway</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.order_id ?? i} onClick={onRowClick} style={{ cursor: 'pointer' }}>
              <td className="dim">{r.date}</td>
              <td>{r.name}</td>
              <td className="mono">{r.mobile}</td>
              <td>{r.metal}</td>
              <td className="num">{r.amount}</td>
              <td className="num">{r.grams}</td>
              <td>{r.payment ? <Badge variant={PAYMENT_VARIANT[r.payment] || 'muted'}>{r.payment}</Badge> : '—'}</td>
              <td>
                <Badge variant={ORDER_VARIANT[r.order] || 'muted'}>{r.order || '—'}</Badge>
              </td>
              <td>{r.gateway || '—'}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9} className="empty-note">
                No orders in this window.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function sellRow(r) {
  return {
    order_id: r.order_id,
    date: (r.order_date || '').slice(0, 10),
    name: r.client_name,
    mobile: r.client_mobile,
    metal: r.metal_type,
    amount: inr(r.sell_value),
    grams: Number(r.sold_grams || 0).toFixed(2),
    payment: r.payment_status,
    order: r.order_status,
    gateway: r.payment_gateway,
  };
}

function redeemRow(r) {
  return {
    order_id: r.order_id,
    date: (r.order_date || '').slice(0, 10),
    name: r.client_name,
    mobile: r.client_mobile,
    metal: r.metal_type,
    amount: inr(r.order_value),
    grams: Number(r.item_grams || 0).toFixed(2),
    payment: null,
    order: r.order_status,
    gateway: null,
  };
}

export default function BusinessOverview() {
  const navigate = useNavigate();
  const showToast = useToast();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year] = useState(today.getFullYear());
  const [overview, setOverview] = useState(null);
  const [sells, setSells] = useState([]);
  const [redeems, setRedeems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getMisOverview(month, year)
      .then((res) => {
        if (!cancelled) setOverview(res);
      })
      .catch(() => {
        /* handled globally for 401s; other failures just leave the panel empty */
      });
    return () => {
      cancelled = true;
    };
  }, [month, year]);

  useEffect(() => {
    let cancelled = false;
    getSells(30)
      .then((res) => {
        if (!cancelled) setSells(res?.sells || []);
      })
      .catch(() => {});
    getRedeems(30)
      .then((res) => {
        if (!cancelled) setRedeems(res?.redeems || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const goUsers = () => navigate('/users');
  const goUsersFlagged = () => navigate('/users', { state: { kyc: 'rejected' } });
  const goOrders = () => navigate('/orders');

  const gmv = overview?.gmv || {};
  const aum = overview?.aum || {};
  const coupons = overview?.coupons || {};
  const watchlist = overview?.watchlist || {};
  const mdr = overview?.mdr || {};

  const monthSelect = (
    <select className="mis-select" title="Choose month for this MTD figure" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
      {MONTH_NAMES.map((m, i) => (
        <option key={m} value={i + 1}>
          {m}
        </option>
      ))}
    </select>
  );

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Business Overview — MIS Snapshot</h2>
          <div className="desc">Mirrors the Karatly Master MIS report</div>
        </div>
        <div className="flex gap-8">
          <Badge variant="muted">Source: Karatly Master MIS</Badge>
          <button className="btn btn-sm" type="button" onClick={() => showToast('Exporting MIS to Excel…')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12M7 11l5 5 5-5" />
              <path d="M4 19h16" />
            </svg>
            Export MIS (Excel)
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Business Value (GMV)</h3>
            <div className="desc">Gold, silver &amp; diamond order value — count and ₹ value by period</div>
          </div>
        </div>
        <div className="grid-3">
          <div className="kpi-card">
            <span className="kpi-bar gold"></span>
            <div className="kpi-label">YTD</div>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 10, marginTop: 8 }}>
              <div>
                <div className="faint" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Count</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{num(gmv.gmv_ytd_count)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="faint" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Value</div>
                <div className="kpi-value" style={{ fontSize: 18, color: 'var(--gold)' }}>{inrCompact(gmv.gmv_ytd_value)}</div>
              </div>
            </div>
          </div>
          <div className="kpi-card">
            <span className="kpi-bar gold"></span>
            <div className="flex gap-6" style={{ alignItems: 'center' }}>
              <span className="kpi-label" style={{ margin: 0 }}>MTD</span>
              {monthSelect}
            </div>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 10, marginTop: 8 }}>
              <div>
                <div className="faint" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Count</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{num(gmv.gmv_mtd_count)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="faint" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Value</div>
                <div className="kpi-value" style={{ fontSize: 18, color: 'var(--gold)' }}>{inrCompact(gmv.gmv_mtd_value)}</div>
              </div>
            </div>
          </div>
          <div className="kpi-card">
            <span className="kpi-bar gold"></span>
            <div className="kpi-label">FTD</div>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 10, marginTop: 8 }}>
              <div>
                <div className="faint" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Count</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{num(gmv.gmv_ftd_count)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="faint" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Value</div>
                <div className="kpi-value" style={{ fontSize: 18, color: 'var(--gold)' }}>{inrCompact(gmv.gmv_ftd_value)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Transaction Count</h3>
              <div className="desc">MTD order outcomes</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction MTD count</th>
                  <th>Successful</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="num">{num(gmv.txn_mtd_total)}</td>
                  <td className="num">{num(gmv.txn_mtd_success)}</td>
                  <td>
                    <Badge variant="critical">{num(gmv.txn_mtd_failed)}</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Users</h3>
              <div className="desc">Unique vs. repeat vs. flagged usage</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Unique</th>
                  <th>Repeat user</th>
                  <th>Flagged (KYC rejected)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="num">{num(gmv.unique_users)}</td>
                  <td className="num">{num(gmv.repeat_users)}</td>
                  <td>
                    <a href="javascript:void(0)" onClick={goUsersFlagged} className="badge critical" style={{ cursor: 'pointer' }}>
                      {num(gmv.flagged_users)}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Metal Holdings</h3>
            <div className="desc">Gold, silver &amp; diamond purchased on the platform — consolidated in one place</div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Metal</th>
                <th className="num">Grams / carats purchased</th>
                <th className="num">Value</th>
                <th className="num">% of GMV</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="row-label">Gold</td>
                <td className="num">{Number(gmv.gold_grams || 0).toFixed(1)} g</td>
                <td className="num">{inrCompact(gmv.gold_value)}</td>
                <td className="num">{gmv.gold_pct_gmv ?? 0}%</td>
              </tr>
              <tr>
                <td className="row-label">Silver</td>
                <td className="num">{Number(gmv.silver_grams || 0).toFixed(1)} g</td>
                <td className="num">{inrCompact(gmv.silver_value)}</td>
                <td className="num">{gmv.silver_pct_gmv ?? 0}%</td>
              </tr>
              <tr>
                <td className="row-label">Diamond</td>
                <td className="num">{Number(gmv.diamond_carats || 0).toFixed(1)} ct</td>
                <td className="num">{inrCompact(gmv.diamond_value)}</td>
                <td className="num">{gmv.diamond_pct_gmv ?? 0}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Coupon Usage</h3>
            <div className="desc">Coupons redeemed by customers — YTD / MTD</div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th className="num">Count</th>
                <th className="num">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="row-label">YTD</td>
                <td className="num">{num(coupons.coupons_ytd_count)}</td>
                <td className="num">{inr(coupons.coupons_ytd_value)}</td>
              </tr>
              <tr>
                <td className="row-label">MTD</td>
                <td className="num">{num(coupons.coupons_mtd_count)}</td>
                <td className="num">{inr(coupons.coupons_mtd_value)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 6 }}>
        <div>
          <h2>Sell vs. Redeem</h2>
          <div className="desc">
            Recent orders on each side of the book, last 30 days · click "View more" for the full user list
          </div>
        </div>
      </div>
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Sell orders</h3>
              <div className="desc">Customers liquidating metal holdings</div>
            </div>
          </div>
          <OrderTable rows={sells.map(sellRow)} onRowClick={goUsers} gramsLabel="Grams" />
          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <a href="javascript:void(0)" onClick={goUsers} className="btn btn-ghost btn-sm">
              View more{' '}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Redeem orders</h3>
              <div className="desc">Customers redeeming metal for physical delivery</div>
            </div>
          </div>
          <OrderTable rows={redeems.map(redeemRow)} onRowClick={goUsers} gramsLabel="Grams" />
          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <a href="javascript:void(0)" onClick={goUsers} className="btn btn-ghost btn-sm">
              View more{' '}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>MDR</h3>
            <div className="desc">Merchant discount rate by payment mode</div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>UPI</th>
                <th>Debit card</th>
                <th>Credit card</th>
                <th>Netbanking</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="num">{mdr.upi ?? '—'}%</td>
                <td className="num">{mdr.debit_card ?? '—'}%</td>
                <td className="num">{mdr.credit_card ?? '—'}%</td>
                <td className="num">{mdr.netbanking ?? '—'}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Metal Balance (AUM)</h3>
            <div className="desc">Gold, silver &amp; diamond value held in custody for customers — run-rate</div>
          </div>
        </div>
        <div className="grid-3">
          <div className="kpi-card">
            <span className="kpi-bar gold"></span>
            <div className="kpi-label">YTD</div>
            <div className="kpi-value" style={{ fontSize: 20, color: 'var(--gold)', marginTop: 8 }}>{inrCompact(aum.aum_ytd)}</div>
          </div>
          <div className="kpi-card">
            <span className="kpi-bar gold"></span>
            <div className="flex gap-6" style={{ alignItems: 'center' }}>
              <span className="kpi-label" style={{ margin: 0 }}>MTD</span>
              {monthSelect}
            </div>
            <div className="kpi-value" style={{ fontSize: 20, color: 'var(--gold)', marginTop: 8 }}>{inrCompact(aum.aum_mtd)}</div>
          </div>
          <div className="kpi-card">
            <span className="kpi-bar gold"></span>
            <div className="kpi-label">Run rate</div>
            <div className="kpi-value" style={{ fontSize: 20, color: 'var(--gold)', marginTop: 8 }}>{inrCompact(aum.aum_run_rate_monthly)} / mo</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="kv-row">
            <span className="k">Avg. holding per user</span>
            <span className="v">{inr(aum.avg_holding_per_user)}</span>
          </div>
          <div className="kv-row">
            <span className="k">Redemption rate</span>
            <span className="v">{aum.redemption_rate_pct ?? 0}% of AUM / month</span>
          </div>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 6 }}>
        <div>
          <h2>Metal watchlist</h2>
          <div className="desc">Margin and volume outliers by metal — from the last 30 days</div>
        </div>
        <a href="javascript:void(0)" onClick={goOrders} className="btn btn-ghost btn-sm">
          Open Orders{' '}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </a>
      </div>
      <div className="report-grid">
        <div className="report-card" onClick={goOrders}>
          <div className="r-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </div>
          <h4>High margin metal</h4>
          <p>Best spread contribution this month.</p>
          <div className="r-foot">
            {watchlist.high_margin_metal ? (
              <Badge variant="success">
                {watchlist.high_margin_metal} · {watchlist.high_margin_pct}% spread
              </Badge>
            ) : (
              <Badge variant="muted">No data</Badge>
            )}
          </div>
        </div>
        <div className="report-card" onClick={goOrders}>
          <div className="r-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
          <h4>Low margin metal</h4>
          <p>Thinnest spread — review pricing.</p>
          <div className="r-foot">
            {watchlist.low_margin_metal ? (
              <Badge variant="warning">
                {watchlist.low_margin_metal} · {watchlist.low_margin_pct}% spread
              </Badge>
            ) : (
              <Badge variant="muted">No data</Badge>
            )}
          </div>
        </div>
        <div className="report-card" onClick={goOrders}>
          <div className="r-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20V10M11 20V4M18 20v-7" />
            </svg>
          </div>
          <h4>High volume metal</h4>
          <p>Most purchased metal, last 30 days.</p>
          <div className="r-foot">
            {watchlist.high_volume_metal ? (
              <Badge variant="info">
                {watchlist.high_volume_metal} · {Number(watchlist.high_volume_grams || 0).toFixed(1)} g
              </Badge>
            ) : (
              <Badge variant="muted">No data</Badge>
            )}
          </div>
        </div>
        <div className="report-card" onClick={goOrders}>
          <div className="r-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 2 20h20z" />
              <path d="M12 10v4M12 17h.01" />
            </svg>
          </div>
          <h4>Zero volume metal</h4>
          <p>No purchases in the last 30 days.</p>
          <div className="r-foot">
            <Badge variant="critical">{watchlist.zero_volume_metals || 'None'}</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
