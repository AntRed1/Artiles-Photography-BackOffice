import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { decodeJwt, type JwtPayload, hasAdminRole } from "../utils/jwt";
import {
  login as loginService,
  register as registerService,
  type AuthResponse,
} from "../services/authService";
import api from "../services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: JwtPayload | null;
  isAdmin: boolean;
  loading: boolean; // Add loading property
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("jwt")
  );
  const [loading, setLoading] = useState(true); // Initialize loading state

  // Check token on initial render
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const storedToken = localStorage.getItem("jwt");
        if (storedToken) {
          // Optionally validate the token with the backend
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        localStorage.removeItem("jwt");
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const user = useMemo(() => {
    const decoded = decodeJwt();
    console.log("Decoded JWT en AuthProvider:", decoded);
    if (decoded && token) {
      return { ...decoded, name: decoded.name || "Usuario" };
    }
    console.log("No user decoded", { token });
    return null;
  }, [token]);

  const isAdmin = useMemo(() => {
    const admin = hasAdminRole(user);
    console.log("isAdmin:", admin, "User roles:", user?.roles);
    return admin;
  }, [user]);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    console.log("AuthContext login called", { email });
    setLoading(true);
    try {
      const response: AuthResponse = await loginService({ email, password });
      localStorage.setItem("jwt", response.token);
      setToken(response.token);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log("AuthContext register called", { name, email });
    setLoading(true);
    try {
      const response: AuthResponse = await registerService({
        name,
        email,
        password,
      });
      localStorage.setItem("jwt", response.token);
      setToken(response.token);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error al registrarse"
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("AuthContext logout called");
    setLoading(true);
    try {
      await api("/auth/logout", "POST");
    } catch (error) {
      console.warn(
        "Logout endpoint failed, proceeding with client-side logout:",
        error
      );
    } finally {
      localStorage.removeItem("jwt");
      setToken(null);
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isAdmin,
    loading, // Include loading in context value
    login,
    register,
    logout,
  };

  console.log("AuthProvider rendered", { isAuthenticated, isAdmin, loading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
