import type { User } from "../types/user";
import api from "./api";

/**
 * Obtiene todos los usuarios.
 */
export const getUsers = (): Promise<User[]> => api("/admin/users");

/**
 * Crea un nuevo usuario.
 */
export const createUser = (
  user: Omit<User, "id" | "lastAccess">
): Promise<User> => api("/admin/users", "POST", user);

/**
 * Actualiza un usuario existente por ID.
 */
export const updateUser = (id: number, user: Partial<User>): Promise<User> =>
  api(`/admin/users/${id}`, "PUT", user);

/**
 * Elimina un usuario por ID.
 */
export const deleteUser = (id: number): Promise<void> =>
  api(`/admin/users/${id}`, "DELETE");

/**
 * Actualiza los roles del usuario (solo ADMIN).
 */
export const updateUserRoles = (
  userId: number,
  roles: string[]
): Promise<User> => api(`/auth/admin/users/${userId}/roles`, "PUT", { roles });
