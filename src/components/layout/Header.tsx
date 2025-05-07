import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Header: React.FC = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user } = useAuth();

  const notifications = [
    {
      id: 1,
      icon: "fa-user-plus",
      text: "Nuevo usuario registrado",
      time: "Hace 5 minutos",
      color: "indigo",
    },
    {
      id: 2,
      icon: "fa-image",
      text: "12 nuevas imágenes subidas",
      time: "Hace 2 horas",
      color: "green",
    },
    {
      id: 3,
      icon: "fa-exclamation-triangle",
      text: "Alerta de espacio de almacenamiento",
      time: "Hace 1 día",
      color: "amber",
    },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-6 py-3">
        <div className="text-xl font-semibold text-gray-800">
          {window.location.pathname === "/" && "Panel de Control"}
          {window.location.pathname === "/users" &&
            "Gestión de Usuarios y Roles"}
          {window.location.pathname === "/gallery" && "Gestión de Contenido"}
          {window.location.pathname === "/packages" && "Paquetes Fotográficos"}
          {window.location.pathname === "/testimonials" && "Testimonios"}
          {window.location.pathname === "/settings" && "Configuración General"}
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <i className="fas fa-bell"></i>
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Notificaciones</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border-b hover:bg-gray-50"
                    >
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div
                            className={`bg-${notification.color}-100 rounded-full p-2`}
                          >
                            <i
                              className={`fas ${notification.icon} text-${notification.color}-600`}
                            ></i>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">
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
                <div className="p-2 text-center border-t">
                  <button className="text-sm text-indigo-600 hover:text-indigo-800">
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
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.name.charAt(0) || "CR"}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">
                  {user?.name || "Carlos Rodríguez"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role || "Administrador"}
                </div>
              </div>
              <i className="fas fa-chevron-down text-gray-500 text-xs"></i>
            </button>
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mi Perfil
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Configuración
                  </a>
                  <div className="border-t border-gray-100"></div>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar Sesión
                  </a>
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
