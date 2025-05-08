/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import type { Testimonial } from "../types/testimonial";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  toggleTestimonialVisibility,
  deleteTestimonial,
} from "../services/testimonialService";

const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    id?: number;
    author: string;
    comment: string;
    rating: number;
  }>({ author: "", comment: "", rating: 5 });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        await updateTestimonial(formData.id, {
          author: formData.author,
          comment: formData.comment,
          rating: formData.rating,
        });
      } else {
        await createTestimonial({
          author: formData.author,
          comment: formData.comment,
          rating: formData.rating,
        });
      }
      const data = await getTestimonials();
      setTestimonials(data);
      setModalOpen(false);
      setFormData({ author: "", comment: "", rating: 5 });
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
    } catch (err) {
      setError("Error al cambiar visibilidad");
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
    } catch (err) {
      setError("Error al eliminar testimonio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold"></h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Nuevo Testimonio
        </button>
      </div>

      {loading && (
        <div className="text-center">
          <i className="fas fa-spinner animate-spin text-2xl"></i>
        </div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-indigo-600 font-semibold">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.author}</h3>
                  <p className="text-sm text-gray-500">Cliente</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() =>
                      setFormData({
                        id: testimonial.id,
                        author: testimonial.author,
                        comment: testimonial.comment,
                        rating: testimonial.rating,
                      })
                    }
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{testimonial.comment}</p>
              <div className="flex items-center justify-between">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star ${
                        i < testimonial.rating
                          ? "text-amber-400"
                          : "text-gray-300"
                      }`}
                    ></i>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {testimonial.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {formData.id ? "Editar Testimonio" : "Nuevo Testimonio"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Autor
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Comentario
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                  rows={4}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
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
                  className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} Estrella{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  {loading && <i className="fas fa-spinner animate-spin"></i>}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsPage;
