import { createContext, useEffect, useState } from "react";
import api from "../services/api.js";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/auth/profile");
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (credentials, role = "patient") => {
    const endpoint = role === "patient" ? "/auth/patient/login" : "/auth/doctor/login";
    const response = await api.post(endpoint, credentials);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (payload, role = "patient") => {
    const endpoint = role === "patient" ? "/auth/patient/register" : "/auth/doctor/register";
    const response = await api.post(endpoint, payload);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
