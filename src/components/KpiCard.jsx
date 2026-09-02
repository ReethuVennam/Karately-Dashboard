/**
 * One KPI tile from the .kpi-grid — a colored top bar, a label, a big mono
 * value and an optional note. `extraClass` maps to the .kpi-card.warn /
 * .kpi-card.ok variants used for the reconciliation KPIs on Overview.
 */
export default function KpiCard({ bar = 'gold', label, value, note, extraClass }) {
  return (
    <div className={`kpi-card${extraClass ? ' ' + extraClass : ''}`}>
      <span className={`kpi-bar ${bar}`}></span>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {note ? <div className="kpi-note">{note}</div> : null}
    </div>
  );
}
