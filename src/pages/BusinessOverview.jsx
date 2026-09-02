import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import { useToast } from '../context/ToastContext';

/* Static MIS snapshot — mirrors the Karatly Master MIS report. Unlike the
   other pages this isn't backed by mockApi.js: the original HTML rendered
   these numbers straight into the markup (no ?days= API), so they're
   hardcoded here the same way, as of 31 Aug 2026, 21:00 IST. */

const buyOrders = [
  { date: '2026-08-25', name: 'Sai Kiran', mobile: '9963710150', metal: 'gold', amount: '10,000', gold: '0.6', payment: 'SUCCESS', order: 'completed', gateway: 'CASHFREE', title: 'Successfully bought 0.6 grams of gold @ 6740.28', label: 'Successfully bought 0.6 grams…', noteClass: 'faint' },
  { date: '2026-08-22', name: 'Ravi Teja', mobile: '9000112233', metal: 'diamond', amount: '37,200', gold: '—', payment: 'SUCCESS', order: 'completed', gateway: 'CASHFREE', title: 'Successfully bought 0.12 grams of diamond @ 310000.00', label: 'Successfully bought 0.12 grams…', noteClass: 'faint' },
  { date: '2026-08-18', name: 'Faisal Ahmed', mobile: '9988776655', metal: 'gold', amount: '8,000', gold: '—', payment: 'SUCCESS', order: 'completed', gateway: 'CASHFREE', title: 'Augmont allocation timed out — payment captured but gold not yet credited', label: '⚠️ Augmont allocation timed out…', noteClass: 'dim' },
  { date: '2026-08-29', name: 'Karthik Iyer', mobile: '9812340098', metal: 'gold', amount: '6,000', gold: '—', payment: 'FAILED', order: 'failed', gateway: 'EASEBUZZ', title: 'Payment gateway declined the transaction (insufficient funds)', label: '⚠️ Payment gateway declined…', noteClass: 'dim' },
];

const sellOrders = [
  { date: '2026-08-30', name: 'Ravi Teja', mobile: '9000112233', metal: 'gold', amount: '38,000', gold: '5.6', payment: 'SUCCESS', order: 'completed', gateway: 'CASHFREE', title: 'Successfully sold 5.6 grams of gold @ 6785.71', label: 'Successfully sold 5.6 grams…', noteClass: 'faint' },
  { date: '2026-08-25', name: 'Sai Kiran', mobile: '9963710150', metal: 'gold', amount: '12,000', gold: '0.9', payment: 'SUCCESS', order: 'completed', gateway: 'CASHFREE', title: 'Successfully sold 0.9 grams of gold', label: 'Successfully sold 0.9 grams…', noteClass: 'faint' },
  { date: '2026-08-12', name: 'Divya Sharma', mobile: '9711223344', metal: 'silver', amount: '9,400', gold: '—', payment: 'PENDING', order: 'pending', gateway: 'CASHFREE', title: 'Awaiting Augmont confirmation', label: 'Awaiting Augmont confirmation…', noteClass: 'faint' },
  { date: '2026-08-06', name: 'Anjali Reddy', mobile: '9550098712', metal: 'gold', amount: '4,200', gold: '0.4', payment: 'SUCCESS', order: 'completed', gateway: 'EASEBUZZ', title: 'Successfully sold 0.4 grams of gold', label: 'Successfully sold 0.4 grams…', noteClass: 'faint' },
];

const PAYMENT_VARIANT = { SUCCESS: 'success', FAILED: 'critical', PENDING: 'warning' };
const ORDER_VARIANT = { completed: 'success', failed: 'critical', pending: 'warning' };

function OrderTable({ rows, onRowClick }) {
  return (
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
          {rows.map((r, i) => (
            <tr key={i} onClick={onRowClick} style={{ cursor: 'pointer' }}>
              <td className="dim">{r.date}</td>
              <td>{r.name}</td>
              <td className="mono">{r.mobile}</td>
              <td>{r.type}</td>
              <td>{r.metal}</td>
              <td className="num">{r.amount}</td>
              <td className="num">{r.gold}</td>
              <td>
                <Badge variant={PAYMENT_VARIANT[r.payment]}>{r.payment}</Badge>
              </td>
              <td>
                <Badge variant={ORDER_VARIANT[r.order]}>{r.order}</Badge>
              </td>
              <td>{r.gateway}</td>
              <td className={`addr-cell ${r.noteClass}`} title={r.title}>
                {r.label}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BusinessOverview() {
  const navigate = useNavigate();
  const showToast = useToast();

  const goUsers = () => navigate('/users');
  const goUsersFlagged = () => navigate('/users', { state: { kyc: 'rejected' } });
  const goOrders = () => navigate('/orders');

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Business Overview — MIS Snapshot</h2>
          <div className="desc">Mirrors the Karatly Master MIS report · figures as of 31 Aug 2026, 21:00 IST</div>
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
                <div className="faint" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Count
                </div>
                <div className="kpi-value" style={{ fontSize: 18 }}>
                  148,600
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="faint" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Value
                </div>
                <div className="kpi-value" style={{ fontSize: 18, color: 'var(--gold)' }}>
                  ₹18.42 Cr
                </div>
              </div>
            </div>
          </div>
          <div className="kpi-card">
            <span className="kpi-bar gold"></span>
            <div className="flex gap-6" style={{ alignItems: 'center' }}>
              <span className="kpi-label" style={{ margin: 0 }}>
                MTD
              </span>
              <select className="mis-select" title="Choose month for this MTD figure" defaultValue="Aug">
                <option>Jan</option>
                <option>Feb</option>
                <option>Mar</option>
                <option>Apr</option>
                <option>May</option>
                <option>Jun</option>
                <option>Jul</option>
                <option>Aug</option>
                <option>Sep</option>
                <option>Oct</option>
                <option>Nov</option>
                <option>Dec</option>
              </select>
            </div>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 10, marginTop: 8 }}>
              <div>
                <div className="faint" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Count
                </div>
                <div className="kpi-value" style={{ fontSize: 18 }}>
                  14,220
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="faint" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Value
                </div>
                <div className="kpi-value" style={{ fontSize: 18, color: 'var(--gold)' }}>
                  ₹1.68 Cr
                </div>
              </div>
            </div>
          </div>
          <div className="kpi-card">
            <span className="kpi-bar gold"></span>
            <div className="kpi-label">FTD</div>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 10, marginTop: 8 }}>
              <div>
                <div className="faint" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Count
                </div>
                <div className="kpi-value" style={{ fontSize: 18 }}>
                  612
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="faint" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Value
                </div>
                <div className="kpi-value" style={{ fontSize: 18, color: 'var(--gold)' }}>
                  ₹7.4 L
                </div>
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
                  <td className="num">14,220</td>
                  <td className="num">13,540</td>
                  <td>
                    <Badge variant="critical">680</Badge>
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
                  <td className="num">8,940</td>
                  <td className="num">5,280</td>
                  <td>
                    <a href="javascript:void(0)" onClick={goUsersFlagged} className="badge critical" style={{ cursor: 'pointer' }}>
                      41
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
                <th className="num">Grams purchased</th>
                <th className="num">Value</th>
                <th className="num">% of GMV</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="row-label">Gold</td>
                <td className="num">612.4 g</td>
                <td className="num">₹15.86 Cr</td>
                <td className="num">86.1%</td>
              </tr>
              <tr>
                <td className="row-label">Silver</td>
                <td className="num">2,140.0 g</td>
                <td className="num">₹1.88 Cr</td>
                <td className="num">10.2%</td>
              </tr>
              <tr>
                <td className="row-label">Diamond</td>
                <td className="num">18.6 ct</td>
                <td className="num">₹0.68 Cr</td>
                <td className="num">3.7%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-head" style={{ marginTop: 6 }}>
        <div>
          <h2>Buy vs. Sell</h2>
          <div className="desc">Recent orders on each side of the book — click "View more" for the full user list</div>
        </div>
      </div>
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Buy orders</h3>
              <div className="desc">Customers purchasing metal</div>
            </div>
          </div>
          <OrderTable rows={buyOrders.map((r) => ({ ...r, type: 'Buy' }))} onRowClick={goUsers} />
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
              <h3>Sell orders</h3>
              <div className="desc">Customers liquidating metal holdings</div>
            </div>
          </div>
          <OrderTable rows={sellOrders.map((r) => ({ ...r, type: 'Sell' }))} onRowClick={goUsers} />
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

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Karatly Earn</h3>
              <div className="desc">Commission Karatly earns from its metal vendors</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th className="num">Value</th>
                  <th className="num">% of GMV</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-label">Augmont commission</td>
                  <td className="num">₹11.2 L</td>
                  <td className="num">0.6%</td>
                </tr>
                <tr>
                  <td className="row-label">SafeGold commission</td>
                  <td className="num">₹7.4 L</td>
                  <td className="num">0.4%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Karatly Payout</h3>
              <div className="desc">Wallet points Karatly credits to customers</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th className="num">Value</th>
                  <th className="num">% of GMV</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-label">Wallet points credited</td>
                  <td className="num">₹5.6 L</td>
                  <td className="num">0.3%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Customer Earn</h3>
              <div className="desc">Wallet points and coupons earned by customers</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th className="num">Value</th>
                  <th className="num">% of GMV</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-label">Wallet points earned</td>
                  <td className="num">₹5.6 L</td>
                  <td className="num">0.3%</td>
                </tr>
                <tr>
                  <td className="row-label">Coupons redeemed value</td>
                  <td className="num">₹2.9 L</td>
                  <td className="num">0.16%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Customer Burn</h3>
              <div className="desc">Cashback redeemed by customers on the platform</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th className="num">Value</th>
                  <th className="num">% of GMV</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-label">Cashback redeemed</td>
                  <td className="num">₹3.2 L</td>
                  <td className="num">0.17%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid-2">
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
                  <td className="num">0.30%</td>
                  <td className="num">0.90%</td>
                  <td className="num">1.80%</td>
                  <td className="num">0.60%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Profit</h3>
              <div className="desc">Net platform profit</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Value</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="num">₹47.2 L</td>
                  <td className="num">2.56%</td>
                </tr>
              </tbody>
            </table>
          </div>
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
            <div className="kpi-value" style={{ fontSize: 20, color: 'var(--gold)', marginTop: 8 }}>
              ₹22.4 Cr
            </div>
          </div>
          <div className="kpi-card">
            <span className="kpi-bar gold"></span>
            <div className="flex gap-6" style={{ alignItems: 'center' }}>
              <span className="kpi-label" style={{ margin: 0 }}>
                MTD
              </span>
              <select className="mis-select" title="Choose month for this MTD figure" defaultValue="Aug">
                <option>Jan</option>
                <option>Feb</option>
                <option>Mar</option>
                <option>Apr</option>
                <option>May</option>
                <option>Jun</option>
                <option>Jul</option>
                <option>Aug</option>
                <option>Sep</option>
                <option>Oct</option>
                <option>Nov</option>
                <option>Dec</option>
              </select>
            </div>
            <div className="kpi-value" style={{ fontSize: 20, color: 'var(--gold)', marginTop: 8 }}>
              ₹1.92 Cr
            </div>
          </div>
          <div className="kpi-card">
            <span className="kpi-bar gold"></span>
            <div className="kpi-label">FTD</div>
            <div className="kpi-value" style={{ fontSize: 20, color: 'var(--gold)', marginTop: 8 }}>
              ₹9.6 L
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="kv-row">
            <span className="k">Run rate</span>
            <span className="v">₹2.1 Cr / month</span>
          </div>
          <div className="kv-row">
            <span className="k">Avg. holding per user</span>
            <span className="v">₹18,240</span>
          </div>
          <div className="kv-row">
            <span className="k">Redemption rate</span>
            <span className="v">3.9% of AUM / month</span>
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
            <Badge variant="success">Gold · 2.3% spread</Badge>
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
            <Badge variant="warning">Silver · 0.6% spread</Badge>
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
            <Badge variant="info">Gold · 612.4 g</Badge>
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
            <Badge variant="critical">Platinum · 0 g</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
