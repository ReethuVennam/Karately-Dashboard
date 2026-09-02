import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AdminManagement from './pages/AdminManagement';
import Alerts from './pages/Alerts';
import BusinessOverview from './pages/BusinessOverview';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Overview from './pages/Overview';
import UserDetail from './pages/UserDetail';
import Users from './pages/Users';

function AuthLoading() {
  return (
    <div className="login-wrap">
      <div className="dim">Loading…</div>
    </div>
  );
}

/* Gates the dashboard shell on a valid session. Shows a small loading
   state while the initial validate-token restore is in flight, otherwise
   redirects to /login. */
function RequireAuth({ children }) {
  const { currentAdmin, isLoading } = useAuth();
  if (isLoading) return <AuthLoading />;
  if (!currentAdmin) return <Navigate to="/login" replace />;
  return children;
}

/* /login itself: bounce back to the dashboard if already signed in. */
function PublicOnly({ children }) {
  const { currentAdmin, isLoading } = useAuth();
  if (isLoading) return <AuthLoading />;
  if (currentAdmin) return <Navigate to="/" replace />;
  return children;
}

/* Mirrors the prototype's nav-admin show/hide-for-non-super-admin behavior
   at the route level too — a non-super-admin hitting /admin directly gets
   bounced back to the overview. */
function RequireSuperAdmin({ children }) {
  const { currentAdmin } = useAuth();
  if (!currentAdmin?.isSuperAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <Login />
                </PublicOnly>
              }
            />
            <Route
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Overview />} />
              <Route path="/business" element={<BusinessOverview />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/:clientId" element={<UserDetail />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route
                path="/admin"
                element={
                  <RequireSuperAdmin>
                    <AdminManagement />
                  </RequireSuperAdmin>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
