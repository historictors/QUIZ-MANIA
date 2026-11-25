import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('cq_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cq_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Restore session on refresh via GET /api/auth/me
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('cq_token');
      if (storedToken) {
        try {
          const res = await API.get('/auth/me');
          if (res.data?.success && res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem('cq_user', JSON.stringify(res.data.data));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session restore failed:', err);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = (userData, authToken) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('cq_token', authToken);
    localStorage.setItem('cq_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cq_token');
    localStorage.removeItem('cq_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, isAuthenticated: !!token && !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
