import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUsers, saveUsers } from '../data/userData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem('aarogyasetu_session');
      if (session) {
        const parsed = JSON.parse(session);
        setUser(parsed);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  function login(email, password) {
    const users = getStoredUsers();
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, error: 'Invalid email or password' };
    }
    // Don't store password in session
    const sessionUser = { ...found };
    delete sessionUser.password;
    setUser(sessionUser);
    localStorage.setItem('aarogyasetu_session', JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  }

  function register(userData) {
    const users = getStoredUsers();

    // Check duplicate email
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const newUser = {
      id: `USR-${userData.role === 'customer' ? 'C' : 'H'}-${String(users.length + 1).padStart(3, '0')}`,
      ...userData,
      avatar: userData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      registeredAt: new Date().toISOString().split('T')[0],
    };

    users.push(newUser);
    saveUsers(users);

    // Auto-login after registration
    const sessionUser = { ...newUser };
    delete sessionUser.password;
    setUser(sessionUser);
    localStorage.setItem('aarogyasetu_session', JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('aarogyasetu_session');
  }

  function updateProfile(updates) {
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveUsers(users);
      const sessionUser = { ...users[idx] };
      delete sessionUser.password;
      setUser(sessionUser);
      localStorage.setItem('aarogyasetu_session', JSON.stringify(sessionUser));
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
