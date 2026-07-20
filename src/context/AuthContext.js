import React, { createContext, useContext, useEffect, useState } from 'react';
import { setAuthContext } from '../utils/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const stored = localStorage.getItem('auth');
      if (!stored) return setAuthReady(true);
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.token) return setAuthReady(true);
        setToken(parsed.token);
        setUser(parsed.user || null);

        const baseUrl = process.env.REACT_APP_API_BASE_URL || '/api';
        const response = await fetch(`${baseUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${parsed.token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const refreshed = { token: parsed.token, user: data.user };
          setUser(data.user);
          localStorage.setItem('auth', JSON.stringify(refreshed));
        } else if (response.status === 401) {
          setToken(null);
          setUser(null);
          localStorage.removeItem('auth');
        }
      } catch {
        // Keep the cached session if the network is temporarily unavailable.
      } finally {
        setAuthReady(true);
      }
    };
    restoreSession();
  }, []);

  const login = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('auth', JSON.stringify(data));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth');
  };

  const updateUserCoins = (newCoinCount, newPoints = null) => {
    if (user) {
      const updatedUser = { 
        ...user, 
        coins: newCoinCount,
        ...(newPoints !== null && { points: newPoints })
      };
      setUser(updatedUser);
      const stored = localStorage.getItem('auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.user = updatedUser;
          localStorage.setItem('auth', JSON.stringify(parsed));
        } catch {}
      }
    }
  };

  const updateUserAvatar = (userData) => {
    if (user && userData) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      const stored = localStorage.getItem('auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.user = updatedUser;
          localStorage.setItem('auth', JSON.stringify(parsed));
        } catch {}
      }
    }
  };

  // Set auth context reference for API client
  const authContextMethods = { logout, login };
  useEffect(() => {
    setAuthContext(authContextMethods);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, authReady, login, logout, updateUserCoins, updateUserAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 
