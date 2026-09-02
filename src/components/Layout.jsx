import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <div className="shell">
      <Sidebar />
      <Topbar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
