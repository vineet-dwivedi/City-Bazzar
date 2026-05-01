import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, setAuthToken } from '../lib/api.js';
import { normalizeRole } from '../lib/routes.js';

const STORAGE_KEY = 'urbnbzr-auth';
const AuthContext = createContext(null);

const mapApiUser = (user) => ({
  id: user.id,
  role: normalizeRole(user.role),
  backendRole: user.role,
  name: user.fullName,
  fullName: user.fullName,
  email: user.email || '',
  phone: user.phone || '',
  isVerified: user.isVerified,
  status: user.status,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
});

const readStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const storedSession = readStoredSession();

    if (!storedSession?.token) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const hydrateSession = async () => {
      try {
        setAuthToken(storedSession.token);
        const currentUser = await authApi.me();

        if (!active) {
          return;
        }

        const mappedUser = mapApiUser(currentUser);
        setUser(mappedUser);
        setToken(storedSession.token);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          token: storedSession.token,
          user: mappedUser,
        }));
      } catch {
        if (!active) {
          return;
        }

        setAuthToken(null);
        setUser(null);
        setToken(null);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    hydrateSession();

    return () => {
      active = false;
    };
  }, []);

  const persistSession = (nextToken, nextUser) => {
    setAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      token: nextToken,
      user: nextUser,
    }));
  };

  const login = async ({ email, phone, password }) => {
    const response = await authApi.login({ email, phone, password });
    const mappedUser = mapApiUser(response.user);
    persistSession(response.token, mappedUser);
    return mappedUser;
  };

  const register = async ({ fullName, email, phone, password, role }) => {
    const response = await authApi.register({
      fullName,
      email,
      phone,
      password,
      role: role === 'seller' ? 'shop_owner' : 'customer',
    });
    const mappedUser = mapApiUser(response.user);
    persistSession(response.token, mappedUser);
    return mappedUser;
  };

  const refreshUser = async () => {
    const currentUser = await authApi.me();
    const mappedUser = mapApiUser(currentUser);
    setUser(mappedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      token,
      user: mappedUser,
    }));
    return mappedUser;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    refreshUser,
    logout,
  }), [loading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
