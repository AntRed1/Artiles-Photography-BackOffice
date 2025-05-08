import React, { useState, useEffect } from "react";
import { getUsers, deleteUser } from "../../services/userService";
import type { User } from "../../types/user";
import { useAuth } from "../../context/AuthContext";

interface UserListProps {
  onEdit: (user: User | null) => void;
}

const UserList: React.FC<UserListProps> = ({ onEdit }) => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState<{
    id: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        setAlert({
          type: "error",
          message: `No se pudieron cargar los usuarios: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`,
        });
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
      setAlert({
        type: "success",
        message: "Usuario eliminado correctamente",
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: `No se pudo eliminar el usuario: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      });
    }
    setShowDeleteModal(null);
  };

  const mapRoleToFrontend = (role: string): string => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "EDITOR":
        return "Editor";
      case "VISUALIZADOR":
        return "Visualizador";
      case "USER":
        return "Usuario";
      default:
        return role;
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) &&
      (roleFilter ? user.roles.includes(roleFilter) : true) &&
      (statusFilter
        ? statusFilter === "Activo"
          ? user.enabled
          : !user.enabled
        : true)
  );

  const renderAlertIcon = () => {
    if (!alert) return null;
    return alert.type === "success" ? (
      <svg
        className="w-6 h-6 text-green-700"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    ) : (
      <svg
        className="w-6 h-6 text-red-700"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Cargando...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      {alert && (
        <div
          role="alert"
          aria-live="assertive"
          className={`${
            alert.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          } p-4 mb-4 rounded-lg flex items-center space-x-3 transition-all duration-500 ease-in-out`}
        >
          {renderAlertIcon()}
          <span>{alert.message}</span>
        </div>
      )}

      {showDeleteModal && isAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar a{" "}
              <strong>{showDeleteModal.name}</strong>? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">Administrador</option>
              <option value="EDITOR">Editor</option>
              <option value="VISUALIZADOR">Visualizador</option>
              <option value="USER">Usuario</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Roles
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : role === "EDITOR"
                            ? "bg-blue-100 text-blue-800"
                            : role === "VISUALIZADOR"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {mapRoleToFrontend(role)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.enabled
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.enabled ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {isAdmin && (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar"
                        aria-label={`Editar usuario ${user.name}`}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() =>
                          setShowDeleteModal({ id: user.id, name: user.name })
                        }
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                        aria-label={`Eliminar usuario ${user.name}`}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
