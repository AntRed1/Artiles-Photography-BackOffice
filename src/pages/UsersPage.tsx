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
      <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              Gestión de Usuarios y Roles
            </h1>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              aria-label="Agregar nuevo usuario"
            >
              + Agregar Usuario
            </button>
          </div>

          <UserList onEdit={handleOpenModal} />

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
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
