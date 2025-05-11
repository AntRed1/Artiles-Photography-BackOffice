/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
  import { toast } from "react-toastify";
import type { Testimonial } from "../types/testimonial";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  toggleTestimonialVisibility,
  deleteTestimonial,
} from "../services/testimonialService";
import Modal from "../components/common/Modal";

const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // Nuevo estado para mensajes de éxito
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [formData, setFormData] = useState<{
    id?: number;
    name: string;
    message: string;
    rating: number;
  }>({ name: "", message: "", rating: 5 });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setError("Debes iniciar sesión para acceder a esta página.");
      navigate("/login");
    }
  }, [navigate]);

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        const data = await getTestimonials();
        setTestimonials(data);
      } catch (err) {
        setError("Error al cargar testimonios");
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "El nombre es obligatorio";
    if (!formData.message) newErrors.message = "El mensaje es obligatorio";
    if (!formData.rating || formData.rating < 1 || formData.rating > 5)
      newErrors.rating = "La calificación debe estar entre 1 y 5";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (formData.id) {
        await updateTestimonial(formData.id, {
          name: formData.name,
          message: formData.message,
          rating: formData.rating,
        });
        setSuccess("Testimonio actualizado exitosamente");
      } else {
        await createTestimonial({
          name: formData.name,
          message: formData.message,
          rating: formData.rating,
        });
        setSuccess("Testimonio creado exitosamente");
      }
      const data = await getTestimonials();
      setTestimonials(data);
      setModalOpen(false);
      setFormData({ name: "", message: "", rating: 5 });
      setErrors({});
      setTimeout(() => setSuccess(null), 3000); // Limpiar mensaje de éxito después de 3 segundos
    } catch (err) {
      setError("Error al guardar testimonio");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (id: number) => {
    setLoading(true);
    try {
      await toggleTestimonialVisibility(id);
      const data = await getTestimonials();
      setTestimonials(data);
      setSuccess("Visibilidad del testimonio actualizada exitosamente");
      setTimeout(() => setSuccess(null), 3000); // Limpiar mensaje de éxito
    } catch (err) {
      if (err instanceof Error && err.message.includes("Sesión expirada")) {
        localStorage.removeItem("jwt");
        navigate("/login");
      } else {
        setError("Error al cambiar visibilidad");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await deleteTestimonial(id);
      const data = await getTestimonials();
      setTestimonials(data);
      setDeleteModal(null);
      toast.success("Testimonio eliminado exitosamente", { autoClose: 3000 });
    } catch (err) {
      if (err instanceof Error && err.message.includes("Sesión expirada")) {
        localStorage.removeItem("jwt");
        navigate("/login");
      } else {
        toast.error("Error al eliminar testimonio");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Testimonios
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-sm"
          disabled={loading}
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Nuevo Testimonio</span>
        </button>
      </div>
      {loading && !testimonials.length && (
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
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800 flex items-center space-x-3 shadow-sm">
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 rounded-lg bg-green-100 text-green-800 flex items-center space-x-3 shadow-sm">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{success}</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white rounded-xl shadow-md p-6 transition-transform duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-indigo-600 font-semibold">
                  {testimonial.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-gray-500">Cliente</p>
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => {
                    setFormData({
                      id: testimonial.id,
                      name: testimonial.name,
                      message: testimonial.message,
                      rating: testimonial.rating,
                    });
                    setModalOpen(true);
                  }}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                  aria-label="Editar testimonio"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-5.657 1.414 1.414-5.657L15.586 3.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setDeleteModal({
                      id: testimonial.id,
                      name: testimonial.name,
                    })
                  }
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  aria-label="Eliminar testimonio"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 4v12m4-12v12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {testimonial.message}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? "text-amber-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(testimonial.createdAt)}
              </span>
            </div>
            <div className="mt-4">
              <button
                onClick={() => handleToggleVisibility(testimonial.id)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  testimonial.enable
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {testimonial.enable ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setFormData({ name: "", message: "", rating: 5 });
            setErrors({});
          }}
          title={formData.id ? "Editar Testimonio" : "Nuevo Testimonio"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calificación
              </label>
              <select
                value={formData.rating}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rating: parseInt(e.target.value),
                  })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.rating ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} Estrella{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              {errors.rating && (
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
                  {errors.rating}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setFormData({ name: "", message: "", rating: 5 });
                  setErrors({});
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
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
      {deleteModal && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          title="Confirmar Eliminación"
        >
          <div className="space-y-6">
            <p className="text-gray-600">
              ¿Estás seguro de eliminar el testimonio de{" "}
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

export default TestimonialsPage;
