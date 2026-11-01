import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  language: string;
  setLanguage: (lang: string) => void;
  login: (email: string, pass: string) => Promise<{ access_token: string; user: User }>;
  register: (name: string, email: string, pass: string, lang?: string) => Promise<{ access_token: string; user: User }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('deeptrust_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguageState] = useState<string>(() => localStorage.getItem('deeptrust_lang') || 'en');

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('deeptrust_lang', lang);
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('deeptrust_token');
    if (!storedToken || storedToken === 'null' || storedToken === 'undefined') {
      setUser(null);
      setToken(null);
      return;
    }

    try {
      const u = await api.getMe();
      setUser(u);
      if (u.preferred_language) {
        setLanguageState(u.preferred_language);
      }
    } catch {
      localStorage.removeItem('deeptrust_token');
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('deeptrust_token');
      if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
        try {
          const u = await api.getMe();
          if (isMounted) {
            setUser(u);
            setToken(storedToken);
            if (u.preferred_language) {
              setLanguageState(u.preferred_language);
            }
          }
        } catch {
          if (isMounted) {
            localStorage.removeItem('deeptrust_token');
            setToken(null);
            setUser(null);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('deeptrust_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    if (res.user.preferred_language) {
      setLanguageState(res.user.preferred_language);
      localStorage.setItem('deeptrust_lang', res.user.preferred_language);
    }
    return res;
  };

  const register = async (name: string, email: string, pass: string, lang = 'en') => {
    return await api.register(name, email, pass, lang);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Suppress any network issue during logout
    } finally {
      localStorage.removeItem('deeptrust_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        language,
        setLanguage,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
