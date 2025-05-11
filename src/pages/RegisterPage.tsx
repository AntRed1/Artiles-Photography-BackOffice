/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../components/common/AlertManager";
import Background from "../assets/Background.jpg";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { register } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const validateForm = (updatedFormData: typeof formData) => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!updatedFormData.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    } else if (updatedFormData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!updatedFormData.email.trim()) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!emailRegex.test(updatedFormData.email.trim())) {
      newErrors.email = "Ingresa un correo electrónico válido.";
    }

    if (!updatedFormData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (updatedFormData.password.trim().length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    if (!updatedFormData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirma tu contraseña.";
    } else if (
      updatedFormData.password.trim() !== updatedFormData.confirmPassword.trim()
    ) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
      /* Depuración: registrar los valores para inspeccionar diferencias
      console.log("Password:", updatedFormData.password);
      console.log("Confirm Password:", updatedFormData.confirmPassword);
      */
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    validateForm(updatedFormData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm(formData)) {
      showAlert(
        "error",
        "Por favor, corrige los errores en el formulario.",
        5000
      );
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password.trim()
      );
      showAlert(
        "success",
        "Registro completado. Redirigiendo al login...",
        3000
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message.includes("email already exists")
          ? "El correo electrónico ya está registrado."
          : "No se pudo completar el registro.";
      showAlert("error", errorMessage, 5000);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      const nameInput = document.getElementById("name") as HTMLInputElement;
      nameInput?.focus(); // Enfocar el campo de nombre al cargar
    }
  }, [loading]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm opacity-30 z-0"
        style={{ backgroundImage: `url(${Background})` }}
      />
      <div className="relative z-10 bg-white bg-opacity-95 p-8 rounded-xl shadow-lg w-full max-w-md animate-slide-up">
        <img
          src="/logo.png"
          alt="Logo de Artiles Photography"
          className="mx-auto mb-6 h-20 w-auto"
        />
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Registrarse
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <InputField
            label="Nombre"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tu nombre"
            autoComplete="name"
            error={errors.name}
          />
          <InputField
            label="Correo Electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            error={errors.email}
          />
          <PasswordField
            label="Contraseña"
            name="password"
            value={formData.password}
            onChange={handleChange}
            show={showPassword}
            toggleShow={() => setShowPassword((prev) => !prev)}
            error={errors.password}
          />
          <PasswordField
            label="Confirmar Contraseña"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            show={showConfirmPassword}
            toggleShow={() => setShowConfirmPassword((prev) => !prev)}
            error={errors.confirmPassword}
          />
          <SubmitButton
            loading={loading}
            text="Registrarse"
            loadingText="Registrando..."
            disabled={Object.keys(errors).length > 0 || loading}
          />
        </form>

        <button
          type="button"
          onClick={() => navigate("/login")}
          disabled={loading}
          className={`mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 ${
            loading ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          Volver al Login
        </button>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            © 2025 Artiles Photography Studio. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

// Componentes reutilizables
const InputField = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete: string;
  error?: string;
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required
      className={`w-full px-3 py-2 border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
    />
    {error && (
      <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
);

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  show,
  toggleShow,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  toggleShow: () => void;
  error?: string;
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <div className="relative">
      <input
        id={name}
        name={name}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        required
        placeholder="••••••••"
        autoComplete="new-password"
        className={`w-full px-3 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        aria-label={
          show
            ? `Ocultar ${label.toLowerCase()}`
            : `Mostrar ${label.toLowerCase()}`
        }
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {show ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59"
            />
          ) : (
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </>
          )}
        </svg>
      </button>
    </div>
    {error && (
      <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
);

const SubmitButton = ({
  loading,
  text,
  loadingText,
  disabled,
}: {
  loading: boolean;
  text: string;
  loadingText: string;
  disabled?: boolean;
}) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className={`w-full px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 ${
      loading || disabled ? "cursor-not-allowed" : "cursor-pointer"
    }`}
  >
    {loading && (
      <svg
        className="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
        />
      </svg>
    )}
    <span>{loading ? loadingText : text}</span>
  </button>
);
