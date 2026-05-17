import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem('skylink_auth');
    return raw ? JSON.parse(raw) : null;
  });

  async function login(credentials) {
    const nextAuth = await api.login(credentials);
    localStorage.setItem('skylink_auth', JSON.stringify(nextAuth));
    setAuth(nextAuth);
  }

  async function register(payload) {
    return api.register(payload);
  }

  function logout() {
    localStorage.removeItem('skylink_auth');
    setAuth(null);
  }

  function updateAuth(nextAuth) {
    localStorage.setItem('skylink_auth', JSON.stringify(nextAuth));
    setAuth(nextAuth);
  }

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      token: auth?.token || null,
      isAdmin: auth?.user?.role === 'admin',
      login,
      register,
      updateAuth,
      logout
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
