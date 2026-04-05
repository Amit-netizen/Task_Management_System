'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { getUser, setUser, setTokens, clearTokens, getAccessToken } from '@/lib/storage';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getUser<User>();
    const token = getAccessToken();
    if (stored && token) setUserState(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { user, accessToken, refreshToken } = res.data;
    setTokens(accessToken, refreshToken);
    setUser(user);
    setUserState(user);
    router.push('/dashboard');
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    const { user, accessToken, refreshToken } = res.data;
    setTokens(accessToken, refreshToken);
    setUser(user);
    setUserState(user);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(async () => {
    try {
      const { getRefreshToken } = await import('@/lib/storage');
      const refreshToken = getRefreshToken();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {}
    clearTokens();
    setUserState(null);
    router.push('/auth/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
