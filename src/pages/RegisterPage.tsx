/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlert({
        type: "error",
        message: "Las contraseñas no coinciden",
      });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      await register(name, email, password);
      setAlert({
        type: "success",
        message: "Registro completado. Redirigiendo al login...",
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: "No se pudo completar el registro",
      });
      setLoading(false);
    }
  };

  const handleNavigateLogin = () => {
    navigate("/login");
  };

  // Efecto para manejar la redirección después de mostrar la alerta de éxito
  useEffect(() => {
    if (alert?.type === "success") {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 3000); // Redirige después de 3 segundos
      return () => clearTimeout(timer);
    }
  }, [alert, navigate]);

  // Efecto para desaparecer la alerta de error después de 5 segundos
  useEffect(() => {
    if (alert?.type === "error") {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <img
          src="/logo.png"
          alt="Logo de Artiles Photography"
          className="mx-auto mb-6 h-20 w-auto"
        />
        <h2 className="text-2xl font-bold mb-6 text-center">Registrarse</h2>

        {alert && (
          <div
            role="alert"
            aria-live="assertive"
            className={`${
              alert.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            } p-4 mb-4 rounded-lg flex items-center space-x-3 transition-all duration-500 ease-in-out animate__animated ${
              alert.type === "success" ? "animate__fadeIn" : "animate__fadeOut"
            }`}
          >
            {renderAlertIcon()}
            <span>{alert.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Tu nombre"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="correo@ejemplo.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-3 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 transition-colors duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleNavigateLogin}
          className="mt-4 w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-300 cursor-pointer"
        >
          Volver al Login
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
