import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('bluecollar_token');
    const storedUser  = localStorage.getItem('bluecollar_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('bluecollar_token');
        localStorage.removeItem('bluecollar_user');
      }
    }
    setLoading(false);
  }, []);

  function login(tokenStr, userData) {
    localStorage.setItem('bluecollar_token', tokenStr);
    localStorage.setItem('bluecollar_user', JSON.stringify(userData));
    setToken(tokenStr);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('bluecollar_token');
    localStorage.removeItem('bluecollar_user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
