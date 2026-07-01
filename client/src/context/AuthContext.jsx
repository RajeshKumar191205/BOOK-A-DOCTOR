import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (authToken) => {
    try {
      // Use POST /api/user/getuserdata which correctly reads req.body.userId set by middleware
      const res = await fetch('/api/user/getuserdata', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
          localStorage.setItem('userData', JSON.stringify(data.data));
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  const register = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setToken('');
    setUser(null);
  };

  const authenticatedRequest = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, authenticatedRequest, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
