import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import * as authService from '../services/authService';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMode, setCurrentMode] = useState(() => localStorage.getItem('currentMode') || 'client');

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const res = await authService.getCurrentUser();
        if (mounted) setUser(res.data.data.user);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => { mounted = false; };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const switchMode = useCallback((mode) => {
    setCurrentMode(mode);
    localStorage.setItem('currentMode', mode);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authService.loginUser(email, password);
      const userData = res.data.data.user;
      setUser(userData);
      const role = userData.role || (Array.isArray(userData.roles) ? userData.roles[0] : null) || 'client';
      setCurrentMode(role);
      localStorage.setItem('currentMode', role);
      return res.data;
    } catch (err) {
      const data = err.response?.data;
      const message = data?.message || 'Erreur de connexion';
      setError(message);
      if (err.response?.status >= 500) console.error('[Login Error]', err);
      throw err;
    }
  };

  const register = async (data) => {
    setError(null);
    try {
      const res = await authService.registerUser(data);
      const userData = res.data.data.user;
      setUser(userData);
      const role = userData.role || (Array.isArray(userData.roles) ? userData.roles[0] : null) || 'client';
      setCurrentMode(role);
      localStorage.setItem('currentMode', role);
      return res.data;
    } catch (err) {
      const data = err.response?.data;
      const message = data?.message || "Erreur d'inscription";
      setError(message);
      if (err.response?.status >= 500) console.error('[Register Error]', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logoutUser();
    } finally {
      setUser(null);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, login, register, logout, clearError, currentMode, switchMode, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
