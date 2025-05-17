import React, { createContext, useContext, useMemo, useState } from "react";
import { decodeJwt, type JwtPayload, hasAdminRole } from "../utils/jwt";
import {
  login as loginService,
  register as registerService,
  type AuthResponse,
} from "../services/authService";

interface AuthContextType {
  isAuthenticated: boolean;
  user: JwtPayload | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("jwt")
  );

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
    try {
      const response: AuthResponse = await loginService({ email, password });
      localStorage.setItem("jwt", response.token);
      setToken(response.token);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error al iniciar sesión"
      );
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log("AuthContext register called", { name, email });
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
    }
  };

  const logout = () => {
    console.log("AuthContext logout called");
    localStorage.removeItem("jwt");
    setToken(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isAdmin,
    login,
    register,
    logout,
  };

  console.log("AuthProvider rendered", { isAuthenticated, isAdmin });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
