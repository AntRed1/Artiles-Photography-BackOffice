import type { User } from "../types/user";
import api from "./api";

type UserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  enabled?: boolean;
};

export const getUsers = (): Promise<User[]> => api("/admin/users");

export const createUser = (user: Required<UserPayload>): Promise<User> =>
  api("/admin/users", "POST", {
    ...user,
    roles: [user.role],
  });

export const updateUser = (id: number, user: UserPayload): Promise<User> =>
  api(`/admin/users/${id}`, "PUT", {
    ...user,
    roles: user.role ? [user.role] : undefined,
  });

export const deleteUser = (id: number): Promise<void> =>
  api(`/admin/users/${id}`, "DELETE");

export const updateUserRoles = (
  userId: number,
  roles: string[]
): Promise<User> => api(`/auth/users/${userId}/roles`, "PUT", { roles });
