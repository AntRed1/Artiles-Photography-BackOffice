import React from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { motion } from "framer-motion";

interface AlertProps {
  type: "success" | "error" | "info" | "warning";
  message: string;
  onClose: () => void;
}

const alertStyles = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    bg: "bg-green-50 text-green-800 border-green-500",
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    bg: "bg-red-50 text-red-800 border-red-500",
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-600" />,
    bg: "bg-blue-50 text-blue-800 border-blue-500",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    bg: "bg-yellow-50 text-yellow-800 border-yellow-500",
  },
};

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const { icon, bg } = alertStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      layout
      className={`p-4 rounded-xl flex justify-between items-center shadow-md border-l-4 ${bg}`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 transition"
        aria-label="Cerrar alerta"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default Alert;
