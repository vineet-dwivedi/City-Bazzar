import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('urbnbzr-user')); } catch { return null; }
  });

  const login = (role) => {
    const u = { name: role === 'seller' ? 'Rahul Stores' : role === 'admin' ? 'Admin' : 'Priya', role };
    setUser(u);
    localStorage.setItem('urbnbzr-user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('urbnbzr-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
