import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "./requests/index";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await authAPI.getMe();
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    return response.data;
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);
    setIsGuest(false);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
  };

  const updateAccount = async (data) => {
    const response = await authAPI.updateAccount(data);
    setUser(response.data.user);
    return response.data;
  };

  const value = {
    user,
    loading,
    isGuest,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    continueAsGuest,
    updateAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
