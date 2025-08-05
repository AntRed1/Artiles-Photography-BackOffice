import React, { useState, useEffect } from "react";
import {
  createImage,
  updateImage,
  selectCloudinaryImage,
} from "../../services/galleryService";
import type { GalleryItem } from "../../types/gallery";
import Alert from "../common/Alert";
import {
  fetchCloudinaryImages,
  type CloudinaryResource,
} from "../../services/cloudinaryService";

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
    source: image?.publicId
      ? "cloudinary"
      : ("local" as "local" | "cloudinary"),
    publicId: image?.publicId || null,
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

  // Estados para Cloudinary
  const [cloudinaryImages, setCloudinaryImages] = useState<
    CloudinaryResource[]
  >([]);
  const [loadingCloudinary, setLoadingCloudinary] = useState(false);
  const [showCloudinaryGrid, setShowCloudinaryGrid] = useState(false);

  // Cargar imágenes de Cloudinary cuando se selecciona esa fuente
  useEffect(() => {
    let isMounted = true;
    const loadCloudinaryImages = async () => {
      setLoadingCloudinary(true);
      try {
        const response = await fetchCloudinaryImages(1, 20);
        if (isMounted) setCloudinaryImages(response.images);
      } catch {
        if (isMounted) {
          setAlert({
            type: "error",
            message: "No se pudieron cargar las imágenes de Cloudinary",
          });
        }
      } finally {
        if (isMounted) setLoadingCloudinary(false);
      }
    };

    if (formData.source === "cloudinary") {
      loadCloudinaryImages();
    }

    return () => {
      isMounted = false;
    };
  }, [formData.source]);

  useEffect(() => {
    return () => {
      if (previewUrl && !image?.url && !image?.imageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, image]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validación de imagen según la fuente
    if (!image) {
      if (formData.source === "local" && !formData.file) {
        newErrors.file = "Selecciona una imagen";
      } else if (formData.source === "cloudinary" && !formData.publicId) {
        newErrors.publicId = "Selecciona una imagen de Cloudinary";
      }
    }

    if (formData.type === "carousel" && !formData.title) {
      newErrors.title = "El título es obligatorio";
    }

    if (!formData.description) {
      newErrors.description = "Añade una descripción";
    }

    if (formData.file) {
      if (
        !["image/jpeg", "image/png", "image/gif"].includes(formData.file.type)
      ) {
        newErrors.file = "Solo se permiten imágenes JPEG, PNG o GIF";
      }
      if (formData.file.size > 5 * 1024 * 1024) {
        newErrors.file = "La imagen no debe superar los 5 MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const source = e.target.value as "local" | "cloudinary";
    setFormData({
      ...formData,
      source,
      file: null,
      publicId: null,
    });
    setPreviewUrl(
      image
        ? image.type === "carousel"
          ? image.url ?? null
          : image.imageUrl ?? null
        : null
    );
    setShowCloudinaryGrid(false);
    setErrors({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (previewUrl && !image?.url && !image?.imageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      setFormData({ ...formData, file, publicId: null });
    } else {
      setPreviewUrl(
        image
          ? image.type === "carousel"
            ? image.url ?? null
            : image.imageUrl ?? null
          : null
      );
      setFormData({ ...formData, file: null });
    }
    setErrors({ ...errors, file: "" });
  };

  const handleCloudinarySelect = (publicId: string) => {
    if (publicId) {
      const selectedImage = cloudinaryImages.find(
        (img) => img.public_id === publicId
      );
      if (selectedImage?.secure_url) {
        setPreviewUrl(selectedImage.secure_url);
      }
      setFormData({
        ...formData,
        publicId,
        file: null,
      });
      setShowCloudinaryGrid(false);
    } else {
      setPreviewUrl(
        image
          ? image.type === "carousel"
            ? image.url ?? null
            : image.imageUrl ?? null
          : null
      );
      setFormData({
        ...formData,
        publicId: null,
        file: null,
      });
    }
    setErrors({ ...errors, publicId: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let result: GalleryItem;

      if (image) {
        // Actualizar imagen existente
        result = await updateImage(image.id, {
          file: formData.file,
          title: formData.title,
          description: formData.description,
          type: formData.type as "carousel" | "gallery",
          publicId: formData.publicId || undefined, // Convert null to undefined
        });
        onSubmit(result, "update");
        setAlert({ type: "success", message: "Imagen actualizada con éxito" });
      } else {
        // Crear nueva imagen
        if (formData.source === "local" && formData.file) {
          result = await createImage({
            file: formData.file,
            title: formData.title,
            description: formData.description,
            type: formData.type as "carousel" | "gallery",
          });
        } else if (formData.source === "cloudinary" && formData.publicId) {
          result = await selectCloudinaryImage({
            publicId: formData.publicId,
            title: formData.title,
            description: formData.description,
            type: formData.type as "carousel" | "gallery",
          });
        } else {
          throw new Error("No se seleccionó ninguna imagen válida");
        }

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

  const selectedCloudinaryImage = formData.publicId
    ? cloudinaryImages.find((img) => img.public_id === formData.publicId)
    : null;

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-6 space-y-6">
      {alert && (
        <Alert
          type={alert.type as "success" | "error"}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vista previa de la imagen */}
        {previewUrl && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vista previa de la imagen
            </label>
            <div className="relative w-full h-40 sm:h-48 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
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

        {/* Tipo de imagen */}
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

        {/* Fuente de la imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuente de la imagen
          </label>
          <select
            value={formData.source}
            onChange={handleSourceChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            <option value="local">Subir desde equipo</option>
            <option value="cloudinary">Seleccionar desde Cloudinary</option>
          </select>
        </div>

        {/* Upload local */}
        {formData.source === "local" && (
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
        )}

        {/* Selector de Cloudinary */}
        {formData.source === "cloudinary" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Seleccionar imagen de Cloudinary
              </label>
              <button
                type="button"
                onClick={() => setShowCloudinaryGrid(!showCloudinaryGrid)}
                className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                disabled={isSubmitting || loadingCloudinary}
              >
                {showCloudinaryGrid ? "Ocultar galería" : "Ver galería"}
              </button>
            </div>

            {/* Imagen seleccionada actualmente */}
            {selectedCloudinaryImage && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCloudinaryImage.secure_url}
                    alt={selectedCloudinaryImage.public_id}
                    className="w-16 h-16 object-cover rounded-lg border"
                    onError={(e) =>
                      (e.currentTarget.src = "/placeholder-image.jpg")
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedCloudinaryImage.public_id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(
                        selectedCloudinaryImage.created_at
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(selectedCloudinaryImage.bytes / 1024)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCloudinarySelect("")}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Galería de imágenes */}
            {showCloudinaryGrid && (
              <div className="mb-4">
                {loadingCloudinary ? (
                  <div className="flex items-center justify-center py-8">
                    <svg
                      className="animate-spin h-8 w-8 text-indigo-600"
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
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                    {cloudinaryImages.map((img) => (
                      <div
                        key={img.public_id}
                        className={`relative cursor-pointer group transition-all duration-200 ${
                          formData.publicId === img.public_id
                            ? "ring-2 ring-indigo-500 ring-offset-2"
                            : "hover:ring-2 hover:ring-gray-300"
                        }`}
                        onClick={() => handleCloudinarySelect(img.public_id)}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                          <img
                            src={img.secure_url}
                            alt={img.public_id}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) =>
                              (e.currentTarget.src = "/placeholder-image.jpg")
                            }
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg" />
                        {formData.publicId === img.public_id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <p className="truncate">{img.public_id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {errors.publicId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errors.publicId}
              </p>
            )}
          </div>
        )}

        {/* Título (solo para carousel) */}
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

        {/* Descripción */}
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
            rows={3}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

        {/* Botones */}
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
                    d="M4 12a8 8 0 018-8v8h8 8 0 01-8 8 8 8 0 01-8-8z"
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
