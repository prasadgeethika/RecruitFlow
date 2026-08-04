import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  userId: number;
  role: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  role: string | null;
  email: string | null;
  userId: number | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function readStoredValue(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(key);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredValue('token'));
  const [role, setRole] = useState<string | null>(() => readStoredValue('role'));
  const [email, setEmail] = useState<string | null>(() => readStoredValue('email'));
  const [userId, setUserId] = useState<number | null>(() => {
    const storedUserId = readStoredValue('userId');
    return storedUserId ? Number(storedUserId) : null;
  });

  const login = (newToken: string) => {
    const decoded = jwtDecode<DecodedToken>(newToken);
    const nextUserId = Number(decoded.userId);

    localStorage.setItem('token', newToken);
    localStorage.setItem('role', decoded.role);
    localStorage.setItem('email', decoded.sub);
    localStorage.setItem('userId', String(nextUserId));

    setToken(newToken);
    setRole(decoded.role);
    setEmail(decoded.sub);
    setUserId(nextUserId);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setEmail(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, email, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}