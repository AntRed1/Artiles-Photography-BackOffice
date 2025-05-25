/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ContactMessage } from "../types/contactmessage";
import {
  getContactMessages,
  updateContactMessage,
  deleteContactMessage,
  sendEmail,
} from "../services/contactMessageService";
import Modal from "../components/common/Modal";
import { useAlert } from "../components/common/AlertManager"; // Import the useAlert hook

const ContactMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>(
    []
  );
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [customEmailModalOpen, setCustomEmailModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [formData, setFormData] = useState<{
    id?: number;
    name: string;
    email: string;
    phone: string | null;
    service: string | null;
    message: string;
  }>({ name: "", email: "", phone: null, service: null, message: "" });
  const [customEmailData, setCustomEmailData] = useState<{
    from: string;
    to: string;
    subject: string;
    date: string;
    body: string;
  }>({
    from: "",
    to: "",
    subject: "",
    date: new Date().toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    body: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [customEmailErrors, setCustomEmailErrors] = useState<{
    [key: string]: string;
  }>({});
  const navigate = useNavigate();
  const { showAlert } = useAlert(); // Use the alert hook

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      showAlert("error", "Debes iniciar sesión para acceder a esta página.");
      navigate("/login");
    }
  }, [navigate, showAlert]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await getContactMessages();
        setMessages(data);
        setFilteredMessages(data);
      } catch (err) {
        showAlert("error", "Error al cargar mensajes de contacto");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [showAlert]);

  useEffect(() => {
    const lowerCaseFilter = filter.toLowerCase();
    const filtered = messages.filter(
      (message) =>
        message.name.toLowerCase().includes(lowerCaseFilter) ||
        message.email.toLowerCase().includes(lowerCaseFilter) ||
        (message.service &&
          message.service.toLowerCase().includes(lowerCaseFilter))
    );
    setFilteredMessages(filtered);
  }, [filter, messages]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "El nombre es obligatorio";
    if (!formData.email)
      newErrors.email = "El correo electrónico es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "El correo electrónico no es válido";
    if (!formData.message) newErrors.message = "El mensaje es obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCustomEmailForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!customEmailData.from) newErrors.from = "El campo 'De' es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmailData.from))
      newErrors.from = "El correo 'De' no es válido";
    if (!customEmailData.to) newErrors.to = "El campo 'Para' es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmailData.to))
      newErrors.to = "El correo 'Para' no es válido";
    if (!customEmailData.subject)
      newErrors.subject = "El asunto es obligatorio";
    if (!customEmailData.date) newErrors.date = "La fecha es obligatoria";
    if (!customEmailData.body)
      newErrors.body = "El cuerpo del mensaje es obligatorio";
    setCustomEmailErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (formData.id) {
        await updateContactMessage(formData.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          message: formData.message,
        });
        showAlert("success", "Mensaje actualizado exitosamente");
      }
      const data = await getContactMessages();
      setMessages(data);
      setFilteredMessages(
        data.filter(
          (message) =>
            message.name.toLowerCase().includes(filter.toLowerCase()) ||
            message.email.toLowerCase().includes(filter.toLowerCase()) ||
            (message.service &&
              message.service.toLowerCase().includes(filter.toLowerCase()))
        )
      );
      setModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: null,
        service: null,
        message: "",
      });
      setErrors({});
    } catch (err) {
      showAlert("error", "Error al guardar mensaje");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await deleteContactMessage(id);
      const data = await getContactMessages();
      setMessages(data);
      setFilteredMessages(
        data.filter(
          (message) =>
            message.name.toLowerCase().includes(filter.toLowerCase()) ||
            message.email.toLowerCase().includes(filter.toLowerCase()) ||
            (message.service &&
              message.service.toLowerCase().includes(filter.toLowerCase()))
        )
      );
      setDeleteModal(null);
      showAlert("success", "Mensaje eliminado exitosamente");
    } catch (err) {
      if (err instanceof Error && err.message.includes("Sesión expirada")) {
        localStorage.removeItem("jwt");
        showAlert(
          "error",
          "Sesión expirada. Por favor, inicia sesión nuevamente."
        );
        navigate("/login");
      } else {
        showAlert("error", "Error al eliminar mensaje");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (id: number) => {
    setLoading(true);
    try {
      await sendEmail({ messageId: id });
      showAlert("success", "Correo reenviado exitosamente");
    } catch (err) {
      if (err instanceof Error && err.message.includes("Sesión expirada")) {
        localStorage.removeItem("jwt");
        showAlert(
          "error",
          "Sesión expirada. Por favor, inicia sesión nuevamente."
        );
        navigate("/login");
      } else {
        showAlert("error", "Error al reenviar el correo");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCustomEmailForm()) return;

    setLoading(true);
    try {
      await sendEmail({
        from: customEmailData.from,
        to: customEmailData.to,
        subject: customEmailData.subject,
        date: customEmailData.date,
        body: customEmailData.body,
      });
      setCustomEmailModalOpen(false);
      setCustomEmailData({
        from: "",
        to: "",
        subject: "",
        date: new Date().toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        body: "",
      });
      setCustomEmailErrors({});
      showAlert("success", "Correo personalizado enviado exitosamente");
    } catch (err) {
      if (err instanceof Error && err.message.includes("Sesión expirada")) {
        localStorage.removeItem("jwt");
        showAlert(
          "error",
          "Sesión expirada. Por favor, inicia sesión nuevamente."
        );
        navigate("/login");
      } else {
        showAlert("error", "Error al enviar el correo personalizado");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Gestión de Mensajes de Contacto
        </h1>
      </div>
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar por nombre, email o servicio..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {filter && (
          <button
            onClick={() => setFilter("")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span>Limpiar</span>
          </button>
        )}
        <button
          onClick={() => setCustomEmailModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
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
              d="M3 8l9-6 9 6v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 16v-4"
            />
          </svg>
          <span>Enviar Correo Personalizado</span>
        </button>
      </div>
      {loading && !messages.length && (
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600 mx-auto"
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
        </div>
      )}
      {filteredMessages.length === 0 && !loading && (
        <div className="text-center text-gray-600">
          No se encontraron mensajes que coincidan con el filtro.
        </div>
      )}
      <div className="grid grid-cols-1 gap-6">
        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className="bg-white rounded-xl shadow-md p-4 sm:p-6 transition-transform duration-300 hover:shadow-lg w-full"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-indigo-600 font-semibold">
                    {message.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {message.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {message.email}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-auto flex-shrink-0">
                <button
                  onClick={() => {
                    setFormData({
                      id: message.id,
                      name: message.name,
                      email: message.email,
                      phone: message.phone,
                      service: message.service,
                      message: message.message,
                    });
                    setModalOpen(true);
                  }}
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                  aria-label="Editar mensaje"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-5.657 1.414 1.414-5.657L15.586 3.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleResendEmail(message.id)}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  aria-label="Reenviar correo"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l9-6 9 6v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 16v-4"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setDeleteModal({
                      id: message.id,
                      name: message.name,
                    })
                  }
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  aria-label="Eliminar mensaje"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 4v12m4-12v12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-3">{message.message}</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm text-gray-500">
                {message.service || "Sin servicio"}
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(message.createdAt)}
              </span>
            </div>
            {message.phone && (
              <div className="mt-2 text-sm text-gray-500">
                Tel: {message.phone}
              </div>
            )}
          </div>
        ))}
      </div>
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setFormData({
              name: "",
              email: "",
              phone: null,
              service: null,
              message: "",
            });
            setErrors({});
          }}
          title="Editar Mensaje de Contacto"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4 max-h-[70vh] overflow-y-auto px-1"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value || null })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors border-gray-300"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servicio
              </label>
              <input
                type="text"
                value={formData.service || ""}
                onChange={(e) =>
                  setFormData({ ...formData, service: e.target.value || null })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors border-gray-300"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.message ? "border-red-500" : "border-gray-300"
                }`}
                rows={4}
                disabled={loading}
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {errors.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: null,
                    service: null,
                    message: "",
                  });
                  setErrors({});
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.id}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
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
                <span>Guardar</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
      {customEmailModalOpen && (
        <Modal
          isOpen={customEmailModalOpen}
          onClose={() => {
            setCustomEmailModalOpen(false);
            setCustomEmailData({
              from: "",
              to: "",
              subject: "",
              date: new Date().toLocaleString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              body: "",
            });
            setCustomEmailErrors({});
          }}
          title="Enviar Correo Personalizado"
        >
          <form
            onSubmit={handleCustomEmailSubmit}
            className="space-y-4 max-h-[70vh] overflow-y-auto px-1"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                De
              </label>
              <input
                type="email"
                value={customEmailData.from}
                onChange={(e) =>
                  setCustomEmailData({
                    ...customEmailData,
                    from: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  customEmailErrors.from ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {customEmailErrors.from && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {customEmailErrors.from}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Para
              </label>
              <input
                type="email"
                value={customEmailData.to}
                onChange={(e) =>
                  setCustomEmailData({ ...customEmailData, to: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  customEmailErrors.to ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {customEmailErrors.to && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {customEmailErrors.to}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asunto
              </label>
              <input
                type="text"
                value={customEmailData.subject}
                onChange={(e) =>
                  setCustomEmailData({
                    ...customEmailData,
                    subject: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  customEmailErrors.subject
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                disabled={loading}
              />
              {customEmailErrors.subject && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {customEmailErrors.subject}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="text"
                value={customEmailData.date}
                onChange={(e) =>
                  setCustomEmailData({
                    ...customEmailData,
                    date: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  customEmailErrors.date ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {customEmailErrors.date && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {customEmailErrors.date}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                value={customEmailData.body}
                onChange={(e) =>
                  setCustomEmailData({
                    ...customEmailData,
                    body: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  customEmailErrors.body ? "border-red-500" : "border-gray-300"
                }`}
                rows={4}
                disabled={loading}
              ></textarea>
              {customEmailErrors.body && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {customEmailErrors.body}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setCustomEmailModalOpen(false);
                  setCustomEmailData({
                    from: "",
                    to: "",
                    subject: "",
                    date: new Date().toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    body: "",
                  });
                  setCustomEmailErrors({});
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
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
                <span>Enviar</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleteModal && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          title="Confirmar Eliminación"
        >
          <div className="space-y-6">
            <p className="text-gray-600">
              ¿Estás seguro de eliminar el mensaje de{" "}
              <strong>{deleteModal.name}</strong>? Esta acción es irreversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteModal.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
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
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Eliminar</span>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ContactMessagesPage;
