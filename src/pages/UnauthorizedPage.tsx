import React from "react";
import { Link } from "react-router-dom";

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Acceso No Autorizado
        </h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta página. Por favor, contacta al
          administrador si crees que esto es un error.
        </p>
        <Link
          to="/"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
