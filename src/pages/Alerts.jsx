import { useCallback, useEffect, useState } from 'react';
import { acknowledgeAlert, getAlertsSummary, listAlerts, refreshAlerts, resolveAlert } from '../api/alertsApi';
import Badge from '../components/Badge';
import KpiCard from '../components/KpiCard';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { inr } from '../utils/format';

const DAYS_CHIPS = [
  { days: 1, label: 'Today' },
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
];

const CATEGORY_LABELS = {
  PAID_NO_GOLD: 'Paid but no gold',
  GOLD_NO_PAYMENT: 'Gold but no payment',
  PENDING_OVER_24H: 'Pending > 24h',
  PENDING_OVER_72H: 'Pending > 72h',
  MISSING_CASHFREE_WEBHOOK: 'Missing Cashfree webhook',
  MISSING_EASEBUZZ_RECORD: 'Missing Easebuzz record',
  AUGMONT_PURCHASE_FAILED: 'Augmont purchase failed',
  HIGH_VALUE_PENDING: 'High-value pending',
  DUPLICATE_MERCHANT_TXN: 'Duplicate merchant txn',
  ZERO_QUANTITY_PURCHASE: 'Zero quantity purchased',
};

const SEVERITY_BADGE = { critical: 'critical', high: 'warning', medium: 'medium' };
const STATUS_BADGE = { open: 'warning', acknowledged: 'info', resolved: 'success' };

export default function Alerts() {
  const showToast = useToast();

  const [days, setDays] = useState(7);
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('open');

  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [resolveId, setResolveId] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([listAlerts({ days, category, severity, status }), getAlertsSummary()]);
      setAlerts(listRes?.alerts || []);
      setSummary(summaryRes || null);
    } catch (err) {
      showToast(err?.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [days, category, severity, status, showToast]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAlerts();
      await reload();
      showToast('Alerts refreshed');
    } catch (err) {
      showToast(err?.message || 'Failed to refresh alerts');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeAlert(id);
      showToast('Alert acknowledged');
      reload();
    } catch (err) {
      showToast(err?.message || 'Failed to acknowledge alert');
    }
  };

  const openResolve = (id) => {
    setResolveId(id);
    setResolveNote('');
  };
  const closeResolve = () => {
    setResolveId(null);
    setResolveNote('');
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resolveAlert(resolveId, resolveNote.trim());
      closeResolve();
      showToast('Alert resolved');
      reload();
    } catch (err) {
      showToast(err?.message || 'Failed to resolve alert');
    } finally {
      setSubmitting(false);
    }
  };

  const s = summary;
  const kpiCards = s
    ? [
        { key: 'total_open', bar: 'warning', label: 'Open alerts', value: s.total_open },
        { key: 'critical', bar: 'critical', label: 'Critical', value: s.critical },
        { key: 'high_count', bar: 'warning', label: 'High', value: s.high_count },
        { key: 'medium_count', bar: 'medium', label: 'Medium', value: s.medium_count },
        { key: 'acknowledged', bar: 'info', label: 'Acknowledged', value: s.acknowledged },
        { key: 'resolved_total', bar: 'success', label: 'Resolved', value: s.resolved_total },
      ]
    : [];

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Alerts</h2>
          <div className="desc">Reconciliation checks across orders, payments and gold allocation</div>
        </div>
        <div className="flex gap-8">
          <div className="chip-group">
            {DAYS_CHIPS.map((c) => (
              <span key={c.days} className={`chip${days === c.days ? ' active' : ''}`} onClick={() => setDays(c.days)}>
                {c.label}
              </span>
            ))}
          </div>
          <button className="btn btn-sm" type="button" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6,1fr)' }}>
        {kpiCards.map((c) => (
          <KpiCard key={c.key} bar={c.bar} label={c.label} value={c.value} />
        ))}
      </div>

      <div className="toolbar">
        <div className="select-box">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="select-box">
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>
        <div className="select-box">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="ALL">All</option>
          </select>
        </div>
        <div className="result-count">
          {alerts.length} alert{alerts.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Severity</th>
                <th>Category</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th className="num">Amount ₹</th>
                <th>Message</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} style={{ cursor: 'default' }}>
                  <td className="id-cell">{a.id}</td>
                  <td>
                    <Badge variant={SEVERITY_BADGE[a.severity] || 'muted'}>{a.severity}</Badge>
                  </td>
                  <td>{CATEGORY_LABELS[a.category] || a.category}</td>
                  <td>{a.client_name || '—'}</td>
                  <td className="mono">{a.client_mobile || '—'}</td>
                  <td className="num">{inr(a.amount)}</td>
                  <td className="addr-cell dim" title={a.message || ''}>
                    {a.message || '—'}
                  </td>
                  <td>
                    <Badge variant={STATUS_BADGE[a.status] || 'muted'}>{a.status}</Badge>
                  </td>
                  <td className="dim">{a.created_at}</td>
                  <td>
                    <div className="flex gap-6">
                      {a.status === 'open' ? (
                        <button className="btn btn-sm" type="button" onClick={() => handleAcknowledge(a.id)}>
                          Acknowledge
                        </button>
                      ) : null}
                      {a.status !== 'resolved' ? (
                        <button className="btn btn-sm" type="button" onClick={() => openResolve(a.id)}>
                          Resolve
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && alerts.length === 0 ? <div className="empty-note">No alerts match this filter.</div> : null}
      </div>

      {resolveId !== null ? (
        <Modal title="Resolve alert" onClose={closeResolve}>
          <form onSubmit={handleResolve}>
            <div className="field">
              <label>Note (optional)</label>
              <textarea
                rows={3}
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-2)',
                  fontSize: '13.5px',
                  color: 'var(--text)',
                  resize: 'vertical',
                }}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={closeResolve}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                Resolve alert
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  );
}
