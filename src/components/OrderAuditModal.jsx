import { useEffect, useState } from 'react';
import { getOrderAudit } from '../api/dashboardApi';
import { inr, ORDER_BADGE_VARIANT, ORDER_TYPE_LABEL } from '../utils/format';
import Badge from './Badge';
import Modal from './Modal';

const FLAGS = [
  ['cashfree_order_created', 'Cashfree order created'],
  ['webhook_received', 'Webhook received'],
  ['payment_recorded', 'Payment recorded'],
  ['gold_purchased', 'Gold purchased'],
];

/** null/undefined/'' -> '—', booleans -> Yes/No, everything else as-is. */
function fmtVal(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
}

/** One kv-grid section. Renders nothing if every field is empty (unless `always`). */
function KvSection({ title, fields, always }) {
  const hasAny = fields.some(([, v]) => v !== null && v !== undefined && v !== '');
  if (!hasAny && !always) return null;
  return (
    <div className="kv-section">
      <div className="kv-section-title">{title}</div>
      <div className="kv-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {fields.map(([label, value]) => (
          <div className="kv" key={label}>
            <div className="kv-label">{label}</div>
            <div className="kv-value mono">{fmtVal(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditEntry({ entry: e }) {
  return (
    <div className="audit-card panel">
      <div className="audit-card-head">
        <h4>{e.order_reference || e.order_id}</h4>
        <Badge variant={ORDER_BADGE_VARIANT[e.order_status] || 'muted'}>{e.order_status}</Badge>
      </div>

      <div className="audit-flags">
        {FLAGS.map(([key, label]) => (
          <Badge key={key} variant={e[key] === 'YES' ? 'success' : 'critical'}>
            {label}
          </Badge>
        ))}
      </div>

      <KvSection
        title="Order"
        always
        fields={[
          ['Type', ORDER_TYPE_LABEL[e.order_type] || e.order_type],
          ['Amount', e.total_amount != null ? inr(e.total_amount) : null],
          ['Augmont txn id', e.augmont_txn_id],
          ['Failure reason', e.failure_reason],
          ['Date', e.order_date],
        ]}
      />

      <KvSection
        title="Cashfree order"
        fields={[
          ['Status', e.cf_order_status],
          ['Provider order id', e.cf_provider_order_id],
          ['SabbPe order id', e.cf_sabbpe_order_id],
          ['Date', e.cf_order_date],
        ]}
      />

      <KvSection
        title="Cashfree payment"
        fields={[
          ['Status', e.cf_payment_status],
          ['Method', e.cf_payment_method],
          ['RRN', e.cf_rrn],
          ['Date', e.cf_payment_date],
        ]}
      />

      <KvSection
        title="Webhook"
        fields={[
          ['Type', e.webhook_type],
          ['Status', e.webhook_payment_status],
          ['Processed', e.webhook_processed],
          ['Date', e.webhook_date],
        ]}
      />

      <KvSection
        title="Easebuzz"
        fields={[
          ['Payment id', e.easebuzz_payment_id],
          ['Status', e.easebuzz_payment_status],
        ]}
      />

      <KvSection
        title="Augmont"
        fields={[
          ['Quantity', e.augmont_quantity],
          ['Gold balance after', e.gold_balance],
          ['Silver balance after', e.silver_balance],
          ['Invoice', e.augmont_invoice],
          ['Message', e.augmont_message],
          ['Status code', e.augmont_status_code],
        ]}
      />
    </div>
  );
}

/** Fetches and renders the order-audit trail for a merchant transaction id
 *  inside the shared Modal component — an order can have more than one
 *  attempt/record, so this renders one card per entry in `audit`. */
export default function OrderAuditModal({ merchantTransactionId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrderAudit(merchantTransactionId)
      .then((res) => {
        if (!cancelled) setAudit(res?.audit || []);
      })
      .catch(() => {
        if (!cancelled) setAudit([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [merchantTransactionId]);

  return (
    <Modal title="Order audit trail" onClose={onClose} wide>
      {loading ? (
        <div className="empty-note">Loading…</div>
      ) : audit.length === 0 ? (
        <div className="empty-note">No audit trail found for this transaction.</div>
      ) : (
        audit.map((entry) => <AuditEntry key={entry.order_id} entry={entry} />)
      )}
    </Modal>
  );
}
