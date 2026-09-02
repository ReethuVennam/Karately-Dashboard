import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AdminProvider } from './context/AdminContext';
import { ToastProvider } from './context/ToastContext';
import AdminManagement from './pages/AdminManagement';
import BusinessOverview from './pages/BusinessOverview';
import Orders from './pages/Orders';
import Overview from './pages/Overview';
import UserDetail from './pages/UserDetail';
import Users from './pages/Users';

/* Login is skipped in this preview (see AdminContext.jsx) — the app opens
   straight into the dashboard shell with the mock super admin "logged in". */
export default function App() {
  return (
    <AdminProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Overview />} />
              <Route path="/business" element={<BusinessOverview />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/:clientId" element={<UserDetail />} />
              <Route path="/admin" element={<AdminManagement />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AdminProvider>
  );
}
