import React, { createContext, useContext, useEffect, useState } from 'react';
import { setAuthContext } from '../utils/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.token) setToken(parsed.token);
        if (parsed.user) setUser(parsed.user);
      } catch {}
    }
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
    <AuthContext.Provider value={{ token, user, login, logout, updateUserCoins, updateUserAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 