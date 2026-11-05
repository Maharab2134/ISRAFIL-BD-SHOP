import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('israfil_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('israfil_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/me');
          setUser(res.data.user);
          localStorage.setItem('israfil_user', JSON.stringify(res.data.user));
        } catch (err) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('israfil_token');
          localStorage.removeItem('israfil_user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    const { access_token, user: userData } = res.data;

    setToken(access_token);
    setUser(userData);
    localStorage.setItem('israfil_token', access_token);
    localStorage.setItem('israfil_user', JSON.stringify(userData));

    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('israfil_token');
      localStorage.removeItem('israfil_user');
    }
  };

  const hasPermission = (permissionSlug) => {
    if (!user || !user.role) return false;
    if (user.role.slug === 'super-admin' || user.email === 'admin@israfilbd.com') return true;
    const permissions = user.role.permissions || [];
    if (!Array.isArray(permissions)) return false;
    if (permissions.includes('*') || permissions.includes(permissionSlug)) return true;
    return permissions.some(
      (p) => (typeof p === 'string' ? p === permissionSlug : p?.slug === permissionSlug)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

