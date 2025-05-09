import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();

  const menuItems = [
    { path: "/", icon: "tachometer-alt", label: "Panel de Control" },
    { path: "/users", icon: "users", label: "Usuarios y Roles" },
    { path: "/gallery", icon: "images", label: "Gestión de Contenido" },
    { path: "/packages", icon: "camera", label: "Paquetes Fotográficos" },
    { path: "/testimonials", icon: "comment-alt", label: "Testimonios" },
    { path: "/settings", icon: "cog", label: "Configuración" },
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
      className={`bg-indigo-800 text-white ${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-300 flex flex-col h-screen`}
    >
      <div
        className={`p-4 flex ${
          collapsed ? "justify-center" : "justify-between"
        } items-center border-b border-indigo-700`}
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
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
            />
          </svg>
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
                  } w-full p-3 rounded-lg ${
                    isActive ? "bg-indigo-700" : "hover:bg-indigo-700"
                  } transition-colors`
                }
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {item.icon === "tachometer-alt" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 12v4m-8-8H4m12 0h4M6.34 6.34l-2.83-2.83m11.32 11.32l2.83 2.83"
                    />
                  )}
                  {item.icon === "users" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  )}
                  {item.icon === "images" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  )}
                  {item.icon === "camera" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                  )}
                  {item.icon === "comment-alt" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5v-4l-2-2 2-2v-4h14v4l2 2-2 2v4h-6"
                    />
                  )}
                  {item.icon === "cog" && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                  )}
                </svg>
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div
        className={`p-4 border-t border-indigo-700 ${
          collapsed ? "text-center" : ""
        } transition-opacity duration-300 ${
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
