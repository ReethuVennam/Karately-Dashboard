import { useEffect, useMemo, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { getOverview } from '../api/dashboardApi';
import KpiCard from '../components/KpiCard';
import { grams, inr, num } from '../utils/format';

const RANGE_CHIPS = [
  { days: 1, label: 'Today' },
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
];

// Pull the theme's CSS custom properties so the charts use the same
// gold/silver/info/success palette as the rest of the page —
// mirrors renderCharts() reading getComputedStyle(document.documentElement).
function themeColors() {
  const style = getComputedStyle(document.documentElement);
  const get = (name) => style.getPropertyValue(name).trim();
  return {
    gold: get('--gold'),
    silver: get('--silver'),
    info: get('--info'),
    success: get('--success'),
  };
}

export default function Overview() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const colors = useMemo(() => themeColors(), []);

  useEffect(() => {
    let cancelled = false;
    getOverview(days)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        /* handled globally for 401s; other failures just leave the panel empty */
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const k = data?.kpis;
  const daily = data?.daily || [];
  const labelWindow = days === 1 ? 'today' : 'last ' + days + ' days';

  const kpiCards = k
    ? [
        { key: 'total_collected', bar: 'gold', label: 'Total money collected (₹)', value: inr(k.total_collected), note: labelWindow },
        { key: 'gold_grams', bar: 'gold', label: 'Gold purchased (grams)', value: grams(k.gold_grams, 2) + ' g', note: labelWindow },
        { key: 'silver_grams', bar: 'silver', label: 'Silver purchased (grams)', value: grams(k.silver_grams, 2) + ' g', note: labelWindow },
        { key: 'total_users', bar: 'info', label: 'Total users', value: num(k.total_users), note: 'all time' },
        { key: 'kyc_completed', bar: 'success', label: 'KYC completed', value: num(k.kyc_completed), note: 'all time' },
        { key: 'bank_validated', bar: 'success', label: 'Bank validated', value: num(k.bank_validated), note: 'all time' },
        { key: 'sell_count', bar: 'gold', label: 'Sells done', value: num(k.sell_count), note: labelWindow },
        { key: 'redeem_count', bar: 'silver', label: 'Coins redeemed', value: num(k.redeem_count), note: labelWindow },
        { key: 'paid_no_gold', bar: 'warning', extraClass: 'warn', label: '⚠️ Paid but no gold', value: num(k.paid_no_gold), note: 'Payment captured, allocation pending — investigate' },
        { key: 'gold_and_payment', bar: 'success', extraClass: 'ok', label: '✅ Gold + payment OK', value: num(k.gold_and_payment), note: 'Both sides reconciled cleanly' },
      ]
    : [];

  const labels = daily.map((d) => d.date.slice(5));

  const activityData = {
    labels,
    datasets: [
      { label: 'New registrations', data: daily.map((d) => d.new_registrations), backgroundColor: colors.info, borderRadius: 3, maxBarThickness: 14 },
      { label: 'Bank validations', data: daily.map((d) => d.bank_validations), backgroundColor: colors.success, borderRadius: 3, maxBarThickness: 14 },
      { label: 'Sells', data: daily.map((d) => d.sells), backgroundColor: colors.gold, borderRadius: 3, maxBarThickness: 14 },
      { label: 'Redeems', data: daily.map((d) => d.redeems), backgroundColor: colors.silver, borderRadius: 3, maxBarThickness: 14 },
    ],
  };
  const activityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 9, boxHeight: 9, usePointStyle: true, font: { size: 10.5 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
      y: { grid: { color: '#EEEAE0' }, ticks: { font: { size: 10 } } },
    },
  };

  const moneyData = {
    labels,
    datasets: [
      { label: 'Cash collected (₹)', data: daily.map((d) => d.cash_collected), borderColor: colors.gold, backgroundColor: colors.gold + '22', fill: true, tension: 0.35, yAxisID: 'y', pointRadius: 0 },
      { label: 'Gold grams', data: daily.map((d) => d.gold_grams), borderColor: colors.info, backgroundColor: 'transparent', tension: 0.35, yAxisID: 'y1', pointRadius: 0 },
      { label: 'Silver grams', data: daily.map((d) => d.silver_grams), borderColor: colors.silver, backgroundColor: 'transparent', tension: 0.35, yAxisID: 'y1', pointRadius: 0 },
    ],
  };
  const moneyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 9, boxHeight: 9, usePointStyle: true, font: { size: 10.5 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
      y: { position: 'left', grid: { color: '#EEEAE0' }, ticks: { font: { size: 10 }, callback: (v) => '₹' + v } },
      y1: { position: 'right', grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  };

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Dashboard overview</h2>
          <div className="desc">Plain-language snapshot of the business — no SQL required</div>
        </div>
        <div className="chip-group">
          {RANGE_CHIPS.map((c) => (
            <span key={c.days} className={`chip${days === c.days ? ' active' : ''}`} onClick={() => setDays(c.days)}>
              {c.label}
            </span>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        {kpiCards.map((c) => (
          <KpiCard key={c.key} bar={c.bar} label={c.label} value={c.value} note={c.note} extraClass={c.extraClass} />
        ))}
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Growth &amp; activity per day</h3>
              <div className="desc">New registrations, bank validations, sells, redeems</div>
            </div>
          </div>
          <div className="chart-canvas-wrap">{daily.length ? <Bar data={activityData} options={activityOptions} /> : null}</div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Money &amp; metal per day</h3>
              <div className="desc">Cash collected (₹) vs. gold and silver grams</div>
            </div>
          </div>
          <div className="chart-canvas-wrap">{daily.length ? <Line data={moneyData} options={moneyOptions} /> : null}</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Other checks</h3>
            <div className="desc">Secondary counters from the same window</div>
          </div>
        </div>
        {k ? (
          <div className="kv-grid">
            <div className="kv">
              <div className="kv-label">Users with address on file</div>
              <div className="kv-value mono">{num(k.users_with_address)}</div>
            </div>
            <div className="kv">
              <div className="kv-label">Gold value collected (₹)</div>
              <div className="kv-value mono">{inr(k.gold_value)}</div>
            </div>
            <div className="kv">
              <div className="kv-label">Silver value collected (₹)</div>
              <div className="kv-value mono">{inr(k.silver_value)}</div>
            </div>
            <div className="kv">
              <div className="kv-label">Sell value (₹)</div>
              <div className="kv-value mono">{inr(k.sell_value)}</div>
            </div>
            <div className="kv">
              <div className="kv-label">Redeem value (₹)</div>
              <div className="kv-value mono">{inr(k.redeem_value)}</div>
            </div>
            <div className="kv">
              <div className="kv-label">Gold but no payment</div>
              <div className="kv-value mono">{num(k.gold_no_payment)}</div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
