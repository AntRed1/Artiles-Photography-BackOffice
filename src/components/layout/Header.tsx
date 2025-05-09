import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const roleDisplayMap: Record<string, string> = {
  ROLE_ADMIN: "Administrador",
  ROLE_EDITOR: "Editor",
  ROLE_VISUALIZADOR: "Visualizador",
  ROLE_USER: "Usuario",
};

const Header: React.FC = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      icon: "user-plus",
      text: "Nuevo usuario registrado",
      time: "Hace 5 minutos",
      color: "indigo",
    },
    {
      id: 2,
      icon: "image",
      text: "12 nuevas imágenes subidas",
      time: "Hace 2 horas",
      color: "green",
    },
    {
      id: 3,
      icon: "exclamation-triangle",
      text: "Alerta de espacio de almacenamiento",
      time: "Hace 1 día",
      color: "amber",
    },
  ];

  const getDisplayRole = (role?: string): string => {
    if (!role) return "Usuario";
    const normalizedRole = role.startsWith("ROLE_") ? role : `ROLE_${role}`;
    return roleDisplayMap[normalizedRole] || role;
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate("/login");
    }, 500);
  };

  const getPageTitle = () => {
    switch (window.location.pathname) {
      case "/":
        return "Panel de Control";
      case "/users":
        return "Gestión de Usuarios y Roles";
      case "/gallery":
        return "Gestión de Contenido";
      case "/packages":
        return "Gestión de Paquetes Fotográficos";
      case "/testimonials":
        return "Gestión de Testimonios";
      case "/settings":
        return "Configuración General";
      default:
        return "Panel de Control";
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="text-2xl font-bold text-gray-900">{getPageTitle()}</div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label="Notificaciones"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-10 animate-slide-up">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notificaciones
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div
                            className={`bg-${notification.color}-100 rounded-full p-2`}
                          >
                            <svg
                              className={`w-5 h-5 text-${notification.color}-600`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              {notification.icon === "user-plus" && (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              )}
                              {notification.icon === "image" && (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              )}
                              {notification.icon === "exclamation-triangle" && (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              )}
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.text}
                          </p>
                          <p className="text-xs text-gray-500">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center border-t border-gray-200">
                  <button className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              className="flex items-center space-x-2"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              aria-label="Menú de usuario"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || "Usuario"}
                </div>
                <div className="text-xs text-gray-500">
                  {getDisplayRole(user?.roles?.[0])}
                </div>
              </div>
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {userDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10 animate-slide-up ${
                  isLoggingOut ? "opacity-50" : "opacity-100"
                }`}
              >
                <div className="py-1">
                  <a
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Mi Perfil
                  </a>
                  <a
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Configuración
                  </a>
                  <div className="border-t border-gray-200"></div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <svg
                      className={`w-5 h-5 ${
                        isLoggingOut ? "animate-spin" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
