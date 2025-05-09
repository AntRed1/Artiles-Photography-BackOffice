import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import UserList from "../components/users/UserList";
import UserForm from "../components/users/UserForm";
import type { User } from "../types/user";
import { useAuth } from "../context/AuthContext";
import { UserProvider } from "../context/UserContext";

const UsersPage: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleOpenModal = (user: User | null = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  return (
    <UserProvider>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              Gestión de Usuarios y Roles
            </h1>
            <button
              onClick={() => handleOpenModal()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
              aria-label="Agregar nuevo usuario"
            >
              Agregar Usuario
            </button>
          </div>
          <UserList onEdit={handleOpenModal} />
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-transform duration-300 ease-in-out scale-100">
                <UserForm user={selectedUser} onClose={handleCloseModal} />
              </div>
            </div>
          )}
        </div>
      </div>
    </UserProvider>
  );
};

export default UsersPage;
