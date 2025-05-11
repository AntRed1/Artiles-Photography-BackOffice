import React, { useState, useEffect } from "react";
import { createImage, updateImage } from "../../services/galleryService";
import type { GalleryItem } from "../../types/gallery";
import Alert from "../common/Alert";

interface ImageFormProps {
  image: GalleryItem | null;
  onClose: () => void;
  onSubmit: (result: GalleryItem, action: "add" | "update") => void;
}

const ImageForm: React.FC<ImageFormProps> = ({ image, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    file: null as File | null,
    title: image?.title || "",
    description: image?.description || "",
    type: image?.type || "gallery",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    image
      ? image.type === "carousel"
        ? image.url ?? null
        : image.imageUrl ?? null
      : null
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );

  // Liberar la URL de vista previa al desmontar o cambiar archivo
  useEffect(() => {
    return () => {
      if (previewUrl && !image?.url && !image?.imageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, image]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!image && !formData.file) newErrors.file = "Selecciona una imagen";
    if (formData.type === "carousel" && !formData.title)
      newErrors.title = "El título es obligatorio";
    if (!formData.description) newErrors.description = "Añade una descripción";
    if (
      formData.file &&
      !["image/jpeg", "image/png", "image/gif"].includes(formData.file.type)
    )
      newErrors.file = "Solo se permiten imágenes JPEG, PNG o GIF";
    if (formData.file && formData.file.size > 5 * 1024 * 1024)
      newErrors.file = "La imagen no debe superar los 5 MB";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (previewUrl && !image?.url && !image?.imageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(
        image
          ? image.type === "carousel"
            ? image.url ?? null
            : image.imageUrl ?? null
          : null
      );
    }
    setFormData({ ...formData, file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let result: GalleryItem;
      if (image) {
        result = await updateImage(image.id, {
          file: formData.file,
          title: formData.title,
          description: formData.description,
          type: formData.type as "carousel" | "gallery",
        });
        onSubmit(result, "update");
        setAlert({ type: "success", message: "Imagen actualizada con éxito" });
      } else {
        if (!formData.file) throw new Error("No se seleccionó ninguna imagen");
        result = await createImage({
          file: formData.file,
          title: formData.title,
          description: formData.description,
          type: formData.type as "carousel" | "gallery",
        });
        onSubmit(result, "add");
        setAlert({ type: "success", message: "Imagen creada con éxito" });
      }
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      setAlert({
        type: "error",
        message: `No se pudo procesar la imagen: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          type={alert.type as "success" | "error"}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {previewUrl && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vista previa de la imagen
            </label>
            <div className="relative w-full h-48 sm:h-64 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-full h-full object-cover"
                onError={(e) =>
                  (e.currentTarget.src = "/placeholder-image.jpg")
                }
              />
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <svg
                    className="animate-spin h-8 w-8 text-white"
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
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de imagen
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as "carousel" | "gallery",
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            <option value="gallery">Galería</option>
            <option value="carousel">Carrusel</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {image ? "Reemplazar imagen (opcional)" : "Subir imagen"}
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors disabled:opacity-50"
            accept="image/jpeg,image/png,image/gif"
            disabled={isSubmitting}
          />
          {errors.file && (
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
              {errors.file}
            </p>
          )}
        </div>
        {formData.type === "carousel" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            />
            {errors.title && (
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
                {errors.title}
              </p>
            )}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 resize-none ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            rows={4}
            disabled={isSubmitting}
          />
          {errors.description && (
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
              {errors.description}
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
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
                <span>Procesando...</span>
              </>
            ) : (
              <span>{image ? "Actualizar" : "Crear"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImageForm;
