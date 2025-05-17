import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6"
      >
        <div className="flex justify-center">
          <div className="bg-red-100 text-red-600 rounded-full p-4">
            <AlertTriangle className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">
          Acceso No Autorizado
        </h1>
        <p className="text-gray-600">
          No tienes permisos para acceder a esta página. Si crees que esto es
          un error, por favor contacta al administrador.
        </p>
        <Link
          to="/"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-200 shadow-md"
        >
          Volver al Inicio
        </Link>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
