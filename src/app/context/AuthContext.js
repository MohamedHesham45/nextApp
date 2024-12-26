"use client";
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [role, setRole] = useState(null);
  
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedProfile = localStorage.getItem("userProfile");

    if (storedToken && storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      setToken(storedToken);
      setProfile(parsedProfile);
      setIsLoggedIn(true);
      setUserName(parsedProfile.name || "User");
      setRole(parsedProfile.role || null);
    }
    setIsLoaded(true); 
  }, []);

  const login = (token, profile) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userProfile", JSON.stringify(profile));

    setToken(token);
    setProfile(profile);
    setIsLoggedIn(true);
    setUserName(profile.name || "User");
    setRole(profile.role || null);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userProfile");

    setToken(null);
    setProfile({});
    setIsLoggedIn(false);
    setUserName(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, profile, isLoggedIn, userName, isLoaded, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
