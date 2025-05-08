import type { User } from "../types/user";
import api from "./api";

export const getUsers = (): Promise<User[]> => api("/admin/users");

export const createUser = (user: {
  name: string;
  email: string;
  password: string;
  role: string;
  enabled: boolean;
}): Promise<User> => api("/admin/users", "POST", user);

export const updateUser = (
  id: number,
  user: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    enabled?: boolean;
  }
): Promise<User> => api(`/admin/users/${id}`, "PUT", user);

export const deleteUser = (id: number): Promise<void> =>
  api(`/admin/users/${id}`, "DELETE");

export const updateUserRoles = (
  userId: number,
  roles: string[]
): Promise<User> => api(`/auth/users/${userId}/roles`, "PUT", { roles });
