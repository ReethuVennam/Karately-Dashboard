import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUsers } from '../api/dashboardApi';
import Badge from '../components/Badge';
import { grams, inr, kycBadgeVariant } from '../utils/format';

export default function Users() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [kyc, setKyc] = useState(location.state?.kyc || '');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getUsers(search, kyc)
      .then((res) => {
        if (!cancelled) setUsers(res.users || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [search, kyc]);

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Users</h2>
          <div className="desc">Every registered user — click a row for the full profile</div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search name, mobile or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="select-box">
          <select value={kyc} onChange={(e) => setKyc(e.target.value)}>
            <option value="">All KYC statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>
        <div className="result-count">
          {users.length} user{users.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>KYC</th>
                <th>Bank</th>
                <th>Address</th>
                <th className="num">Buys ₹</th>
                <th className="num">Gold g</th>
                <th className="num">Silver g</th>
                <th className="num">Diamond g</th>
                <th className="num">Sells ₹</th>
                <th className="num">Redeem</th>
                <th>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.client_id} onClick={() => navigate('/users/' + u.client_id)}>
                  <td>{u.name}</td>
                  <td className="mono">{u.mobile}</td>
                  <td>
                    <Badge variant={kycBadgeVariant(u.kyc_status)}>{u.kyc_status}</Badge>
                  </td>
                  <td>{u.bank_verified ? <Badge variant="success">Verified</Badge> : <Badge variant="muted">—</Badge>}</td>
                  <td className="addr-cell dim" title={u.primary_address || 'No address on file'}>
                    {u.primary_address || '—'}
                  </td>
                  <td className="num">{inr(u.buy_amount)}</td>
                  <td className="num">{grams(u.gold_grams, 2)}</td>
                  <td className="num">{grams(u.silver_grams, 2)}</td>
                  <td className="num">{grams(u.diamond_grams, 3)}</td>
                  <td className="num">{inr(u.sell_amount)}</td>
                  <td className="num">{u.redeem_count}</td>
                  <td className="dim">{u.last_activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 ? <div className="empty-note">No users match this search / filter.</div> : null}
      </div>
    </section>
  );
}
