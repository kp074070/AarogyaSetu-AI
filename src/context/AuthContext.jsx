import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('aarogyasetu_token');
    const storedUser = localStorage.getItem('aarogyasetu_user');

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        connectSocket();
        // Verify token is still valid
        api.getMe()
          .then(data => {
            setUser(data.user);
            localStorage.setItem('aarogyasetu_user', JSON.stringify(data.user));
          })
          .catch(() => {
            // Token expired — clear session
            localStorage.removeItem('aarogyasetu_token');
            localStorage.removeItem('aarogyasetu_user');
            setUser(null);
            disconnectSocket();
          });
      } catch {
        localStorage.removeItem('aarogyasetu_user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('aarogyasetu_token', data.token);
    localStorage.setItem('aarogyasetu_user', JSON.stringify(data.user));
    setUser(data.user);
    connectSocket();
    return data.user;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('aarogyasetu_token', data.token);
    localStorage.setItem('aarogyasetu_user', JSON.stringify(data.user));
    setUser(data.user);
    connectSocket();
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('aarogyasetu_token');
    localStorage.removeItem('aarogyasetu_user');
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
