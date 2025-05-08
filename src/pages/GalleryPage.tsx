/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import type { GalleryItem } from "../types/gallery";
import {
  getCarouselImages,
  getGalleryImages,
  uploadImage,
  updateImage,
  deleteImage,
} from "../services/galleryService";

const GalleryPage: React.FC = () => {
  const [carouselImages, setCarouselImages] = useState<GalleryItem[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    type: "carousel" | "gallery";
    id?: number;
    file?: File;
    title: string;
    description: string;
    order: number;
  }>({ type: "carousel", title: "", description: "", order: 0 });

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const [carousel, gallery] = await Promise.all([
          getCarouselImages(),
          getGalleryImages(),
        ]);
        setCarouselImages(carousel);
        setGalleryImages(gallery);
      } catch (err) {
        setError("Error al cargar imágenes");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        await updateImage(formData.type, formData.id, {
          title: formData.title,
          description: formData.description,
          order: formData.order,
        });
      } else if (formData.file) {
        await uploadImage(
          formData.type,
          formData.file,
          formData.title,
          formData.description,
          formData.order
        );
      }
      const [carousel, gallery] = await Promise.all([
        getCarouselImages(),
        getGalleryImages(),
      ]);
      setCarouselImages(carousel);
      setGalleryImages(gallery);
      setModalOpen(false);
      setFormData({ type: "carousel", title: "", description: "", order: 0 });
    } catch (err) {
      setError("Error al guardar imagen");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: "carousel" | "gallery", id: number) => {
    setLoading(true);
    try {
      await deleteImage(type, id);
      const [carousel, gallery] = await Promise.all([
        getCarouselImages(),
        getGalleryImages(),
      ]);
      setCarouselImages(carousel);
      setGalleryImages(gallery);
    } catch (err) {
      setError("Error al eliminar imagen");
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
          Nueva Imagen
        </button>
      </div>

      {/* Carousel Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6">
          Gestión del Carrusel Principal
        </h2>
        {loading && (
          <div className="text-center">
            <i className="fas fa-spinner animate-spin text-2xl"></i>
          </div>
        )}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {carouselImages.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow">
              <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() =>
                      setFormData({
                        type: "carousel",
                        id: image.id,
                        title: image.title,
                        description: image.description,
                        order: image.order,
                      })
                    }
                    className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete("carousel", image.id)}
                    className="bg-white text-red-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{image.title}</span>
                  <div className="flex gap-2">
                    {image.order > 1 && (
                      <button className="text-gray-600 hover:text-gray-800">
                        <i className="fas fa-arrow-left"></i>
                      </button>
                    )}
                    {image.order < carouselImages.length && (
                      <button className="text-gray-600 hover:text-gray-800">
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Section */}
      <div>
        <h2 className="text-xl font-bold mb-6">Nuestra Galería</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow">
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() =>
                      setFormData({
                        type: "gallery",
                        id: image.id,
                        title: image.title,
                        description: image.description,
                        order: image.order,
                      })
                    }
                    className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete("gallery", image.id)}
                    className="bg-white text-red-600 p-2 rounded-full hover:bg-gray-100"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{image.title}</span>
                  <div className="flex gap-2">
                    {image.order > 1 && (
                      <button className="text-gray-600 hover:text-gray-800">
                        <i className="fas fa-arrow-left"></i>
                      </button>
                    )}
                    {image.order < galleryImages.length && (
                      <button className="text-gray-600 hover:text-gray-800">
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {formData.id ? "Editar Imagen" : "Nueva Imagen"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "carousel" | "gallery",
                    })
                  }
                  className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                >
                  <option value="carousel">Carrusel</option>
                  <option value="gallery">Galería</option>
                </select>
              </div>
              {!formData.id && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Archivo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, file: e.target.files?.[0] })
                    }
                    className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                  rows={4}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Orden
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value),
                    })
                  }
                  className="border border-gray-300 rounded-lg w-full p-2 text-sm"
                />
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

export default GalleryPage;
