import React, { useState, useEffect } from "react";
import type { Package } from "../../types/package";
import Alert from "../common/Alert";
import { ApiError } from "../../services/api";

interface PackageFormProps {
  pkg: Package | null;
  onClose: () => void;
  onSubmit: (data: {
    id?: number;
    title: string;
    description: string;
    price: number;
    file?: File;
    imageUrl: string;
    isActive: boolean;
    showPrice: boolean;
    features: string[];
  }) => void;
}

const PackageForm: React.FC<PackageFormProps> = ({
  pkg,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    id: pkg?.id,
    title: pkg?.title || "",
    description: pkg?.description || "",
    price: pkg?.price || 0,
    file: undefined as File | undefined,
    imageUrl: pkg?.imageUrl || "",
    isActive: pkg?.isActive ?? true,
    showPrice: pkg?.showPrice ?? true,
    features: pkg?.features || [""],
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    pkg?.imageUrl || null
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (previewUrl && !pkg?.imageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, pkg]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title) newErrors.title = "El título es obligatorio";
    if (!formData.description)
      newErrors.description = "La descripción es obligatoria";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "El precio debe ser mayor a 0";
    if (!pkg && !formData.file) newErrors.file = "Debe seleccionar una imagen";
    if (
      formData.file &&
      !["image/jpeg", "image/png"].includes(formData.file.type)
    )
      newErrors.file = "Solo se permiten imágenes JPEG o PNG";
    if (formData.file && formData.file.size > 5 * 1024 * 1024)
      newErrors.file = "La imagen no debe superar los 5 MB";
    if (
      formData.features.length === 0 ||
      formData.features.some((f) => !f.trim())
    )
      newErrors.features = "Debe haber al menos una característica válida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    if (file) {
      if (previewUrl && !pkg?.imageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(pkg?.imageUrl || null);
    }
    setFormData({ ...formData, file });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        price: formData.price || 0,
        features: formData.features.filter((f) => f.trim() !== ""),
      });
      setAlert({
        type: "success",
        message: pkg
          ? "Paquete actualizado con éxito"
          : "Paquete creado con éxito",
      });
      setTimeout(() => onClose(), 1000);
    } catch (error: unknown) {
      const message =
        error instanceof ApiError
          ? error.message
          : "No se pudo procesar el paquete";
      setAlert({
        type: "error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio
          </label>
          <input
            type="number"
            value={formData.price || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                price: e.target.value ? parseFloat(e.target.value) : 0,
              })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
            min="0"
            step="0.01"
            disabled={isSubmitting}
          />
          {errors.price && (
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
              {errors.price}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pkg ? "Reemplazar imagen (opcional)" : "Subir imagen"}
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors disabled:opacity-50"
            accept="image/jpeg,image/png"
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
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
              disabled={isSubmitting}
            />
            <span className="text-sm font-medium text-gray-700">
              Paquete activo
            </span>
          </label>
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.showPrice}
              onChange={(e) =>
                setFormData({ ...formData, showPrice: e.target.checked })
              }
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
              disabled={isSubmitting}
            />
            <span className="text-sm font-medium text-gray-700">
              Mostrar precio
            </span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Características
          </label>
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 ${
                  errors.features && !feature.trim()
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              {formData.features.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
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
                </button>
              )}
            </div>
          ))}
          {errors.features && (
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
              {errors.features}
            </p>
          )}
          <button
            type="button"
            onClick={addFeature}
            className="mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 flex items-center space-x-2"
            disabled={isSubmitting || formData.features.length >= 20}
          >
            <svg
              className="w-4 h-4"
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
            <span>Agregar característica</span>
          </button>
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
              <span>{pkg ? "Actualizar" : "Crear"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackageForm;
