import React, { useState } from "react";
import UserList from "../components/users/UserList";
import UserForm from "../components/users/UserForm";
import type { User } from "../types/user";

const UsersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleOpenModal = (user: User | null = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Gestión de Usuarios y Roles</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Agregar Usuario
        </button>
      </div>
      <UserList onEdit={handleOpenModal} />
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <UserForm user={selectedUser} onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
