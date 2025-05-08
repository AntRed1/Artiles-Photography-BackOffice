import React, { useState } from "react";
import { createUser, updateUser } from "../../services/userService";
import type { User } from "../../types/user";

interface UserFormProps {
  user: User | null;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.roles?.[0] || "Visualizador",
    enabled: user?.enabled !== undefined ? user.enabled : true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );

  const availableRoles = ["Administrador", "Editor", "Visualizador", "Usuario"];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "El nombre es obligatorio";
    if (!formData.email) newErrors.email = "El email es obligatorio";
    if (!user && !formData.password)
      newErrors.password = "La contraseña es obligatoria";
    if (!formData.role) newErrors.role = "Debe seleccionar un rol";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (user) {
        await updateUser(user.id, {
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          role: formData.role,
          enabled: formData.enabled,
        });
        setAlert({
          type: "success",
          message: "Usuario actualizado correctamente",
        });
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          enabled: formData.enabled,
        });
        setAlert({ type: "success", message: "Usuario creado correctamente" });
      }
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      setAlert({
        type: "error",
        message: `Error: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      });
    }
  };

  return (
    <div className="relative">
      <h2 className="text-xl font-semibold mb-4">
        {user ? "Editar Usuario" : "Crear Usuario"}
      </h2>
      {alert && (
        <div
          className={`p-4 mb-4 rounded-lg flex items-center space-x-2 ${
            alert.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <span>{alert.message}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder={user ? "Dejar en blanco para no cambiar" : ""}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
              errors.role ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Seleccionar rol</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-red-500 text-xs mt-1">{errors.role}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) =>
                setFormData({ ...formData, enabled: e.target.checked })
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-sm">Activo</span>
          </label>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {user ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
