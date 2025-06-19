import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);
const OWNER_USERNAME = 'henosis';    // Keep in sync with backend

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('jwt'));
  const [user,  setUser ] = useState(null);

  useEffect(() => {
    token ? localStorage.setItem('jwt', token)
          : localStorage.removeItem('jwt');

    const fetchMe = async () => {
      try { const { data } = await api.get('/auth/me'); setUser(data); }
      catch { setUser(null); }
    };
    if (token) fetchMe();
  }, [token]);

  const login = async (username, password) => {
    const body = new URLSearchParams({ username, password });
    const { data } = await api.post('/auth/login', body);
    setToken(data.access_token);
  };

  const register = async (username, password) => {
    const body = new URLSearchParams({ username, password });
    await api.post('/auth/register', body);
  };

  const logout = () => { setToken(null); setUser(null); }

  const isOwner = user && user.username === OWNER_USERNAME;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, isOwner, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);