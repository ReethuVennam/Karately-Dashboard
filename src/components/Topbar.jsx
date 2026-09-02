import { useLocation } from 'react-router-dom';

const VIEW_META = {
  overview: { title: 'Dashboard overview', desc: 'Money collected, gold & silver purchased, and user growth' },
  business: { title: 'Business Overview', desc: 'MIS snapshot — GMV, metal holdings, earn/burn and profit' },
  orders: { title: 'Orders', desc: 'Order counts, payment status and the underlying transactions' },
  users: { title: 'Users', desc: 'Search and drill into every registered user' },
  'user-detail': { title: 'User detail', desc: 'Profile, orders, banks and addresses' },
  admin: { title: 'Admin management', desc: 'Create admin accounts and reset passwords — super admin only' },
};

function metaForPath(pathname) {
  if (pathname === '/') return VIEW_META.overview;
  if (pathname.startsWith('/business')) return VIEW_META.business;
  if (pathname.startsWith('/orders')) return VIEW_META.orders;
  if (pathname.startsWith('/users/')) return VIEW_META['user-detail'];
  if (pathname.startsWith('/users')) return VIEW_META.users;
  if (pathname.startsWith('/admin')) return VIEW_META.admin;
  return VIEW_META.overview;
}

export default function Topbar() {
  const { pathname } = useLocation();
  const meta = metaForPath(pathname);
  return (
    <div className="topbar">
      <div>
        <h1>{meta.title}</h1>
        <div className="desc">{meta.desc}</div>
      </div>
    </div>
  );
}
