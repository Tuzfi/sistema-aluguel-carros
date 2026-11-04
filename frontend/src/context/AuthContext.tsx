import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, resetCsrfToken, getCsrfToken } from '../api/client';
import type { Usuario } from '../types';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (usuario: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const data = await api.get<Usuario>('/api/auth/me');
      setUsuario(data);
    } catch {
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const encerrar = () => setUsuario(null);
    window.addEventListener('viacar:unauthorized', encerrar);
    return () => window.removeEventListener('viacar:unauthorized', encerrar);
  }, []);

  const login = async (user: string, pass: string) => {
    resetCsrfToken();
    await api.post('/api/auth/login', { usuario: user.trim(), senha: pass });
    resetCsrfToken();
    await getCsrfToken();
    await checkAuth();
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      resetCsrfToken();
      setUsuario(null);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return ctx;
}
