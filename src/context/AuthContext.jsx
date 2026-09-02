import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/authApi';
import { clearSession, getStoredAdmin, getToken, setSession, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [currentAdmin, setCurrentAdmin] = useState(() => getStoredAdmin());
  // True until the initial session-restore (validate-token) call settles.
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setCurrentAdmin(null);
  }, []);

  // On mount: register the 401 handler used by client.js, then — if a token
  // is already stored — confirm it's still valid before letting the app in.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setCurrentAdmin(null);
    });

    let cancelled = false;
    async function restore() {
      const existingToken = getToken();
      if (!existingToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await authApi.validateToken();
        if (cancelled) return;
        // The prototype never wired this endpoint up for real, so its body
        // shape is unknown — any 2xx counts as "still valid". Prefer an
        // `admin` field in the body if present, otherwise keep the cached one.
        const admin = res?.admin || getStoredAdmin();
        if (res?.admin) setSession(existingToken, res.admin);
        setToken(existingToken);
        setCurrentAdmin(admin);
      } catch {
        if (cancelled) return;
        clearSession();
        setToken(null);
        setCurrentAdmin(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (phoneNumber, password) => {
    const data = await authApi.login(phoneNumber, password);
    setToken(data.token);
    setCurrentAdmin(data.admin);
    return data;
  }, []);

  const value = { token, currentAdmin, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
