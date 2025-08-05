import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../components/common/AlertManager";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  FaTachometerAlt,
  FaUsers,
  FaImages,
  FaCamera,
  FaComments,
  FaCog,
  FaFileAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaReceipt,
  FaChartLine,
  FaCertificate,
  FaAngleDown,
  FaAngleRight,
} from "react-icons/fa";

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [facturacionExpanded, setFacturacionExpanded] = useState(false);
  const { logout, isAdmin } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const menuItems = [
    { path: "/", icon: <FaTachometerAlt />, label: "Panel de Control" },
    {
      path: "/users",
      icon: <FaUsers />,
      label: "Usuarios y Roles",
      adminOnly: true,
    },
    {
      path: "/gallery",
      icon: <FaImages />,
      label: "Gestión de Contenido",
      adminOnly: true,
    },
    { path: "/packages", icon: <FaCamera />, label: "Paquetes Fotográficos" },
    { path: "/testimonials", icon: <FaComments />, label: "Testimonios" },
    {
      path: "/contact-messages",
      icon: <FaEnvelope />,
      label: "Mensajes de Contacto",
      adminOnly: true,
    },
    {
      path: "/appointments",
      icon: <FaCalendarAlt />,
      label: "Gestión de Citas",
      adminOnly: true,
    },
    {
      label: "Facturación Electrónica",
      icon: <FaFileInvoiceDollar />,
      expandable: true,
      adminOnly: false,
      children: [
        {
          path: "/invoices/create",
          icon: <FaReceipt />,
          label: "Crear e-CF",
          adminOnly: false,
        },
        {
          path: "/invoices/reports",
          icon: <FaChartLine />,
          label: "Reportes Fiscales",
          adminOnly: true,
        },
        {
          path: "/invoices/certificates",
          icon: <FaCertificate />,
          label: "Certificados Digitales",
          adminOnly: true,
        },
      ],
    },
    {
      path: "/settings",
      icon: <FaCog />,
      label: "Configuración",
      adminOnly: true,
    },
    {
      path: "/logs-actuator",
      icon: <FaFileAlt />,
      label: "Logs y Actuator",
      adminOnly: true,
    },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      showAlert("success", "Sesión cerrada exitosamente");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      showAlert("error", "Error al cerrar sesión. Intenta de nuevo.");
      setIsLoggingOut(false);
    }
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
          {menuItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;

            if (item.expandable) {
              return (
                <li key={item.label} className="mb-1">
                  <button
                    onClick={() => setFacturacionExpanded(!facturacionExpanded)}
                    className={`flex items-center w-full p-3 rounded-lg ${
                      collapsed ? "justify-center" : "justify-between"
                    } hover:bg-indigo-700 transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5">{item.icon}</div>
                      {!collapsed && <span className="ml-3">{item.label}</span>}
                    </div>
                    {!collapsed &&
                      (facturacionExpanded ? (
                        <FaAngleDown className="w-4 h-4" />
                      ) : (
                        <FaAngleRight className="w-4 h-4" />
                      ))}
                  </button>
                  {facturacionExpanded && !collapsed && (
                    <ul className="pl-10 mt-1 space-y-1">
                      {item.children?.map((child) => {
                        if (child.adminOnly && !isAdmin) return null;
                        if (!child.path) return null;
                        return (
                          <li key={child.path}>
                            <NavLink
                              to={child.path}
                              className={({ isActive }) =>
                                `flex items-center w-full p-2 rounded-lg text-sm ${
                                  isActive
                                    ? "bg-indigo-700"
                                    : "hover:bg-indigo-700"
                                } transition-colors`
                              }
                            >
                              <div className="w-4 h-4">{child.icon}</div>
                              <span className="ml-2">{child.label}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            if (!item.path) return null;

            return (
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
            );
          })}
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
