import React, { useState, useEffect } from "react";
import { createUser, updateUser } from "../../services/userService";
import type { User } from "../../types/user";
import Swal from "sweetalert2";

interface UserFormProps {
  user: User | null;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: "Administrador" | "Editor" | "Visualizador";
    status: "Activo" | "Inactivo";
  }>({
    name: "",
    email: "",
    password: "",
    role: "Visualizador",
    status: "Activo",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        status: user.status,
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user) {
        await updateUser(user.id, formData);
        Swal.fire({
          title: "Éxito",
          text: "Usuario actualizado correctamente",
          icon: "success",
          confirmButtonColor: "#E67E22",
        });
      } else {
        await createUser(formData);
        Swal.fire({
          title: "Éxito",
          text: "Usuario creado correctamente",
          icon: "success",
          confirmButtonColor: "#E67E22",
        });
      }
      onClose();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: user
          ? "No se pudo actualizar el usuario"
          : "No se pudo crear el usuario",
        icon: "error",
        confirmButtonColor: "#E67E22",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo Electrónico
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={user ? "Dejar en blanco para no cambiar" : "••••••••"}
          required={!user}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rol
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="Administrador">Administrador</option>
          <option value="Editor">Editor</option>
          <option value="Visualizador">Visualizador</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Guardando..." : user ? "Actualizar" : "Crear"}
        </button>
      </div>
    </div>
  );
};

export default UserForm;
