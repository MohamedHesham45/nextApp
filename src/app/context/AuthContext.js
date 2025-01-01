"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter from Next.js

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(null);
  const [email, setEmail] = useState(null); // Email state
  const [userId, setUserId] = useState(null); // User ID state
  const [isLoaded, setIsLoaded] = useState(false);
  const [role, setRole] = useState(null);
  const [storedProfile, setStoredProfile] = useState(null);

  const router = useRouter(); // Initialize the router
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    setToken(storedToken);
    if (storedToken) {
      verifyToken(storedToken);
    }
  }, []);
  useEffect(() => {
    if (storedProfile) {
      const parsedProfile = storedProfile;
      setProfile(parsedProfile);
      setIsLoggedIn(true);
      setUserName(parsedProfile.name || "User");
      setEmail(parsedProfile.email || null); // Set email from the profile
      setUserId(parsedProfile.userId || null); // Set userId from the profile
      setRole(parsedProfile.role || null);
    }
  }, [storedProfile]);
  const verifyToken = async (storedToken) => {
    try {
      const response = await fetch("/api/auth/verify-token", {
        method: "POST",
        body: JSON.stringify({ token: storedToken }),
      });
      if (response.ok) {
        const data = await response.json();
        setStoredProfile(data);
        return data;
      }else{
        localStorage.removeItem("authToken");
        localStorage.removeItem("userProfile");
      }
    } catch (error) {
      console.error("Error verifying token:", error);
    }finally{
      setIsLoaded(true);
    }
  };

  const login = (token, profile) => {
    localStorage.setItem("authToken", token);
    console.log(profile);
    console.log(token);

    setToken(token);
    setProfile(profile);
    setIsLoggedIn(true);
    setUserName(profile.name || "User");
    setEmail(profile.email || null); // Set email on login
    setUserId(profile.userId || null); // Set userId on login
    setRole(profile.role || null);
  };
  
  const logout = () => {
    router.push("/"); // Navigate to the root route after logout
    localStorage.removeItem("authToken");
    localStorage.removeItem("userProfile");

    setToken(null);
    setProfile({});
    setIsLoggedIn(false);
    setUserName(null);
    setEmail(null); // Clear email on logout
    setUserId(null); // Clear userId on logout
    setRole(null);

  };

  return (
    <AuthContext.Provider
      value={{
        token,
        profile,
        isLoggedIn,
        userName,
        email, // Provide email in the context
        userId, // Provide userId in the context
        isLoaded,
        role,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
