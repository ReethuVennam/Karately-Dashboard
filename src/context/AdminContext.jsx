import { createContext, useContext, useMemo, useState } from 'react';
import { MOCK_ADMIN_ACCOUNTS } from '../data/mockData';

/* Login is skipped in this preview (see the note in the original HTML's
   AUTH FLOW section) — the dashboard opens straight in with the mock
   super admin account already "logged in". */
const CURRENT_ADMIN_ID = 1;

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admins, setAdmins] = useState(MOCK_ADMIN_ACCOUNTS);

  const currentAdmin = useMemo(
    () => admins.find((a) => a.id === CURRENT_ADMIN_ID) || admins[0],
    [admins]
  );

  const createAdmin = ({ fullName, phoneNumber, email, password, isSuperAdmin }) => {
    setAdmins((prev) => [
      ...prev,
      {
        id: prev.length ? Math.max(...prev.map((a) => a.id)) + 1 : 1,
        phoneNumber,
        fullName,
        email,
        password,
        isSuperAdmin,
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ]);
  };

  const resetPassword = (phoneNumber, newPassword) => {
    setAdmins((prev) => prev.map((a) => (a.phoneNumber === phoneNumber ? { ...a, password: newPassword } : a)));
  };

  // Returns true on success, false if the current password didn't match.
  const changePassword = (currentPassword, newPassword) => {
    const acc = admins.find((a) => a.id === currentAdmin.id);
    if (!acc || acc.password !== currentPassword) return false;
    setAdmins((prev) => prev.map((a) => (a.id === currentAdmin.id ? { ...a, password: newPassword } : a)));
    return true;
  };

  const value = { admins, currentAdmin, createAdmin, resetPassword, changePassword };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
}
