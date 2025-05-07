import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  const menuItems = [
    { path: "/", icon: "fa-tachometer-alt", label: "Panel de Control" },
    { path: "/users", icon: "fa-users", label: "Usuarios y Roles" },
    { path: "/gallery", icon: "fa-images", label: "Gestión de Contenido" },
    { path: "/packages", icon: "fa-camera", label: "Paquetes Fotográficos" },
    { path: "/testimonials", icon: "fa-comment-alt", label: "Testimonios" },
    { path: "/settings", icon: "fa-cog", label: "Configuración" },
  ];

  return (
    <div
      className={`bg-indigo-800 text-white ${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-300 flex flex-col`}
    >
      <div
        className={`p-4 flex ${
          collapsed ? "justify-center" : "justify-between"
        } items-center border-b border-indigo-700`}
      >
        {!collapsed && (
          <img
            src="https://static.readdy.ai/image/4820f38f3efa31ae11d6b7e475de5646/9b2916c53c1ccef3625e51e25a07e2f8.png"
            alt="Laura Artiles Fotografía"
            className="h-8 w-auto"
          />
        )}
        {collapsed && (
          <img
            src="https://static.readdy.ai/image/4820f38f3efa31ae11d6b7e475de5646/9b2916c53c1ccef3625e51e25a07e2f8.png"
            alt="Laura Artiles Fotografía"
            className="h-8 w-auto"
          />
        )}
        <button
          className="text-white hover:bg-indigo-700 p-2 rounded-lg"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i
            className={`fas ${
              collapsed ? "fa-chevron-right" : "fa-chevron-left"
            }`}
          ></i>
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
                <i className={`fas ${item.icon}`}></i>
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div
        className={`p-4 border-t border-indigo-700 ${
          collapsed ? "text-center" : ""
        }`}
      >
        <button
          className="text-white hover:bg-indigo-700 p-2 rounded-lg w-full flex items-center justify-center"
          onClick={logout}
        >
          <i className="fas fa-sign-out-alt"></i>
          {!collapsed && <span className="ml-2">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
