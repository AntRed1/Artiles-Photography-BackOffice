import api from "./api";

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  roles: string[];
}

export const login = async (credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  return api<AuthResponse>("/auth/login", "POST", credentials);
};

export const register = async (credentials: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  return api<AuthResponse>("/auth/register", "POST", credentials);
};
