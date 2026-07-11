import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('lifeos_token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('lifeos_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configure default Axios baseURL
    axios.defaults.baseURL = 'http://localhost:8085';

    // Set axios auth header interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('lifeos_token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Set axios response interceptor to handle 401/403 errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const isAuthEndpoint = error.config && (
          error.config.url.includes('/api/auth/login') || 
          error.config.url.includes('/api/auth/register')
        );
        if (!isAuthEndpoint && error.response && (error.response.status === 401 || error.response.status === 403)) {
          logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    setLoading(false);

    // Clean up interceptor on unmount / token changes
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = (authData) => {
    const { token, ...userData } = authData;
    setToken(token);
    setUser(userData);
    localStorage.setItem('lifeos_token', token);
    localStorage.setItem('lifeos_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lifeos_token');
    localStorage.removeItem('lifeos_user');
  };

  const updateUser = (updatedUserData) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedUserData };
      localStorage.setItem('lifeos_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
