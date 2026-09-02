import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getAlertsSummary } from '../api/alertsApi';
import { useAuth } from '../context/AuthContext';

const ALERTS_POLL_MS = 45000;

function navClass({ isActive }) {
  return isActive ? 'nav-item active' : 'nav-item';
}

export default function Sidebar() {
  const { currentAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [openAlerts, setOpenAlerts] = useState(0);

  // Sidebar is always mounted (via Layout), so poll the alerts count from
  // here directly rather than standing up a whole context for one number.
  useEffect(() => {
    let cancelled = false;
    const fetchCount = () => {
      getAlertsSummary()
        .then((res) => {
          if (!cancelled) setOpenAlerts(res?.total_open || 0);
        })
        .catch(() => {
          /* keep last known count on failure */
        });
    };
    fetchCount();
    const id = setInterval(fetchCount, ALERTS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = (currentAdmin?.fullName || '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="coin">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 9.5c0-1.1 1.3-2 3-2s3 .9 3 2-1.3 1.5-3 2-3 .9-3 2 1.3 2 3 2 3-.9 3-2" />
          </svg>
        </div>
        <div className="word">
          Karat<span>ly</span>
        </div>
      </div>

      <div className="nav-section-label">Menu</div>
      <NavLink to="/" end className={navClass}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
        </svg>
        <span>Overview</span>
      </NavLink>
      <NavLink to="/business" end className={navClass}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 12h18" />
          <path d="M10 12v2h4v-2" />
        </svg>
        <span>Business Overview</span>
      </NavLink>
      <NavLink to="/orders" end className={navClass}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
          <path d="M9 7h6M9 11h6M9 15h4" />
        </svg>
        <span>Orders</span>
      </NavLink>
      <NavLink to="/users" end className={navClass}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="8" r="4" />
          <path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 4.2 1.7" />
          <path d="M17 8l5 5M22 8l-5 5" />
        </svg>
        <span>Users</span>
      </NavLink>
      <NavLink to="/alerts" end className={navClass}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v2M5.2 6.2l1.4 1.4M18.8 6.2l-1.4 1.4M5 15a7 7 0 0 1 14 0c0 2 .6 3.2 1.4 4.2H3.6C4.4 18.2 5 17 5 15z" />
          <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
        </svg>
        <span>Alerts</span>
        {openAlerts > 0 ? <span className="badge critical nav-badge">{openAlerts}</span> : null}
      </NavLink>
      {currentAdmin?.isSuperAdmin ? (
        <NavLink to="/admin" end className={navClass}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span>Admin management</span>
        </NavLink>
      ) : null}

      <div className="sidebar-foot">
        <div className="who">
          <div className="av">{initials}</div>
          <div>
            <div className="name">{currentAdmin?.fullName}</div>
            <div className="role">{currentAdmin?.isSuperAdmin ? 'Super admin' : 'Admin'}</div>
          </div>
        </div>
        <button className="btn btn-ghost logout-btn" type="button" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Log out
        </button>
      </div>
    </aside>
  );
}
