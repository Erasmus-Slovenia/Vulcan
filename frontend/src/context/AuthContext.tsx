import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api, setToken, getToken, type User } from '../lib/api';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api<User>('/user').then(setUser).catch(() => setToken(null)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (name: string, password: string) => {
    const data = await api<{ user: User; token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try { await api('/logout', { method: 'POST' }); } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
