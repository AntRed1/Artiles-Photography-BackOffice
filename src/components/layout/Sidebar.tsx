import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  FaTachometerAlt,
  FaUsers,
  FaImages,
  FaCamera,
  FaComments,
  FaCog,
} from "react-icons/fa"; // Importamos los íconos de react-icons

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();

  const menuItems = [
    { path: "/", icon: <FaTachometerAlt />, label: "Panel de Control" },
    { path: "/users", icon: <FaUsers />, label: "Usuarios y Roles" },
    { path: "/gallery", icon: <FaImages />, label: "Gestión de Contenido" },
    { path: "/packages", icon: <FaCamera />, label: "Paquetes Fotográficos" },
    { path: "/testimonials", icon: <FaComments />, label: "Testimonios" },
    { path: "/settings", icon: <FaCog />, label: "Configuración" },
  ];

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      window.location.href = "/login";
    }, 500);
  };

  return (
    <div
      className={`bg-indigo-800 text-white ${collapsed ? "w-20" : "w-64"} 
        transition-all duration-300 flex flex-col h-screen`}
    >
      <div
        className={`p-4 flex ${
          collapsed ? "justify-center" : "justify-between"
        } 
        items-center border-b border-indigo-700`}
      >
        <img
          src="https://static.readdy.ai/image/4820f38f3efa31ae11d6b7e475de5646/9b2916c53c1ccef3625e51e25a07e2f8.png"
          alt="Laura Artiles Fotografía"
          className="h-8 w-auto"
        />
        <button
          className="p-2 text-white hover:bg-indigo-700 rounded-full transition-colors"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? (
            <FiChevronRight className="w-5 h-5" />
          ) : (
            <FiChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className="mb-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${
                    collapsed ? "justify-center" : "justify-start"
                  } 
                  w-full p-3 rounded-lg ${
                    isActive ? "bg-indigo-700" : "hover:bg-indigo-700"
                  } 
                  transition-colors`
                }
              >
                <div className="w-5 h-5">{item.icon}</div>
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div
        className={`p-4 border-t border-indigo-700 ${
          collapsed ? "text-center" : ""
        } 
        transition-opacity duration-300 ${
          isLoggingOut ? "opacity-50" : "opacity-100"
        }`}
      >
        <button
          className="w-full flex items-center justify-center p-2 text-white hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Cerrar sesión"
        >
          <svg
            className={`w-5 h-5 ${collapsed ? "" : "mr-2"} ${
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
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
