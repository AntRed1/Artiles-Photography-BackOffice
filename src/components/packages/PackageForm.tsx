/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import type { Package } from "../../types/package";
import { useAlert } from "../common/AlertManager";

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
  isSubmitting: boolean;
}

const PackageForm: React.FC<PackageFormProps> = ({
  pkg,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    id: pkg?.id,
    title: pkg?.title || "",
    description: pkg?.description || "",
    price: pkg?.price || 0,
    file: undefined as File | undefined,
    imageUrl: pkg?.imageUrl || "", // Changed from null to ""
    isActive: pkg?.isActive ?? true,
    showPrice: pkg?.showPrice ?? true,
    features: pkg?.features || [""],
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    pkg?.imageUrl || null
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    return () => {
      if (previewUrl && !pkg?.imageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, pkg]);

  const validateField = (name: string, value: any) => {
    const newErrors: { [key: string]: string } = { ...errors };
    switch (name) {
      case "title":
        newErrors.title = !value ? "El título es obligatorio" : "";
        break;
      case "description":
        newErrors.description = !value ? "La descripción es obligatoria" : "";
        break;
      case "price":
        newErrors.price =
          !value || value <= 0 ? "El precio debe ser mayor a 0" : "";
        break;
      case "file":
        if (!pkg && !value && !formData.imageUrl)
          newErrors.file = "Debe seleccionar una imagen";
        else if (value && !["image/jpeg", "image/png"].includes(value.type))
          newErrors.file = "Solo se permiten imágenes JPEG o PNG";
        else if (value && value.size > 5 * 1024 * 1024)
          newErrors.file = "La imagen no debe superar los 5 MB";
        else delete newErrors.file;
        break;
      case "features":
        newErrors.features =
          value.length === 0 || value.some((f: string) => !f.trim())
            ? "Debe haber al menos una característica válida"
            : "";
        break;
    }
    setErrors(newErrors);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    });
    validateField(name, value);
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl && !pkg?.imageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      setFormData({ ...formData, file, imageUrl: newPreviewUrl });
      validateField("file", file);
    } else {
      setPreviewUrl(pkg?.imageUrl || null);
      setFormData({
        ...formData,
        file: undefined,
        imageUrl: pkg?.imageUrl || "",
      });
      validateField("file", null);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
    validateField("features", newFeatures);
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
    validateField("features", newFeatures);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = Object.keys(formData).every((key) => {
      validateField(key, formData[key as keyof typeof formData]);
      return !errors[key];
    });

    if (!isValid) {
      showAlert(
        "error",
        "Por favor, corrige los errores en el formulario",
        4000
      );
      return;
    }

    onSubmit({
      ...formData,
      price: formData.price || 0,
      imageUrl: formData.imageUrl || "", // Ensure imageUrl is string
      features: formData.features.filter((f) => f.trim() !== ""),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-6 max-h-[80vh] overflow-y-auto"
    >
      {previewUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vista previa
          </label>
          <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-sm">
            <img
              src={previewUrl}
              alt="Vista previa"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
            />
            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <svg
                  className="animate-spin h-8 w-8 text-white"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          rows={4}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Precio
        </label>
        <input
          type="number"
          name="price"
          value={formData.price || ""}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
            errors.price ? "border-red-500" : "border-gray-300"
          }`}
          min="0"
          step="0.01"
          disabled={isSubmitting}
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {pkg ? "Reemplazar imagen (opcional)" : "Subir imagen"}
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          accept="image/jpeg,image/png"
          disabled={isSubmitting}
        />
        {errors.file && (
          <p className="mt-1 text-sm text-red-600">{errors.file}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleCheckbox}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <span className="text-sm text-gray-700">Paquete activo</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="showPrice"
            checked={formData.showPrice}
            onChange={handleCheckbox}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <span className="text-sm text-gray-700">Mostrar precio</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Características
        </label>
        {formData.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
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
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                disabled={isSubmitting}
              >
                <svg
                  className="w-5 h-5"
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
            )}
          </div>
        ))}
        {errors.features && (
          <p className="mt-1 text-sm text-red-600">{errors.features}</p>
        )}
        <button
          type="button"
          onClick={addFeature}
          className="mt-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 flex items-center gap-2"
          disabled={isSubmitting || formData.features.length >= 20}
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Agregar característica
        </button>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              Procesando...
            </>
          ) : pkg ? (
            "Actualizar"
          ) : (
            "Crear"
          )}
        </button>
      </div>
    </form>
  );
};

export default PackageForm;
