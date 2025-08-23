import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, handleApiError } from '../services/api';
import { getAuthData, setAuthData, clearAuthData, cleanupInvalidData } from '../utils/localStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clean up any invalid data first
    cleanupInvalidData();
    
    // Check if user is logged in on app start
    const { token, user: userData } = getAuthData();
    
    if (token && userData) {
      setUser(userData);
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;
      
      if (token && userData && setAuthData(token, userData)) {
        setUser(userData);
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      clearAuthData();
      setUser(null);
      
      return { 
        success: false, 
        error: handleApiError(error)
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;
      
      if (token && newUser && setAuthData(token, newUser)) {
        setUser(newUser);
        return { success: true };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      clearAuthData();
      setUser(null);
      
      return { 
        success: false, 
        error: handleApiError(error)
      };
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};