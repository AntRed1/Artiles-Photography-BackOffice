/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import type { Package } from "../../types/package";
import { useAlert } from "../common/AlertManager";
import {
  fetchCloudinaryImages,
  type CloudinaryResource,
} from "../../services/cloudinaryService";

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
    publicId?: string | null | undefined;
  }) => Promise<void>;
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
    imageUrl: pkg?.imageUrl || "",
    isActive: pkg?.isActive ?? true,
    showPrice: pkg?.showPrice ?? true,
    features: pkg?.features || [""],
    source: pkg?.publicId ? "cloudinary" : ("local" as "local" | "cloudinary"),
    publicId: pkg?.publicId || null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    pkg?.imageUrl || null
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cloudinaryImages, setCloudinaryImages] = useState<
    CloudinaryResource[]
  >([]);
  const [loadingCloudinary, setLoadingCloudinary] = useState(false);
  const [showCloudinaryGrid, setShowCloudinaryGrid] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadCloudinaryImages = async () => {
      setLoadingCloudinary(true);
      try {
        const response = await fetchCloudinaryImages(1, 20);
        if (isMounted) setCloudinaryImages(response.images);
      } catch {
        if (isMounted) {
          showAlert(
            "error",
            "No se pudieron cargar las imágenes de Cloudinary",
            4000
          );
        }
      } finally {
        if (isMounted) setLoadingCloudinary(false);
      }
    };
    if (formData.source === "cloudinary") loadCloudinaryImages();
    return () => {
      isMounted = false;
    };
  }, [formData.source, showAlert]);

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
        if (!pkg && formData.source === "local" && !value && !formData.imageUrl)
          newErrors.file = "Debe seleccionar una imagen";
        else if (value && !["image/jpeg", "image/png"].includes(value.type))
          newErrors.file = "Solo se permiten imágenes JPEG o PNG";
        else if (value && value.size > 5 * 1024 * 1024)
          newErrors.file = "La imagen no debe superar los 5 MB";
        else delete newErrors.file;
        break;
      case "publicId":
        if (!pkg && formData.source === "cloudinary" && !value)
          newErrors.publicId = "Debe seleccionar una imagen de Cloudinary";
        else delete newErrors.publicId;
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
      if (previewUrl && !pkg?.imageUrl) URL.revokeObjectURL(previewUrl);
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      setFormData({
        ...formData,
        file,
        imageUrl: newPreviewUrl,
        publicId: null,
      });
      validateField("file", file);
    } else {
      setPreviewUrl(pkg?.imageUrl || null);
      setFormData({
        ...formData,
        file: undefined,
        imageUrl: pkg?.imageUrl || "",
        publicId: null,
      });
      validateField("file", null);
    }
  };

  const handleCloudinarySelect = (publicId: string) => {
    if (publicId) {
      const selectedImage = cloudinaryImages.find(
        (img) => img.public_id === publicId
      );
      if (selectedImage?.secure_url) setPreviewUrl(selectedImage.secure_url);
      setFormData({
        ...formData,
        publicId,
        file: undefined,
        imageUrl: selectedImage?.secure_url || "",
      });
      setShowCloudinaryGrid(false);
    } else {
      setPreviewUrl(pkg?.imageUrl || null);
      setFormData({
        ...formData,
        publicId: null,
        file: undefined,
        imageUrl: pkg?.imageUrl || "",
      });
    }
    validateField("publicId", publicId);
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const source = e.target.value as "local" | "cloudinary";
    setFormData({ ...formData, source, file: undefined, publicId: null });
    setPreviewUrl(pkg?.imageUrl || null);
    setShowCloudinaryGrid(false);
    validateField("file", null);
    validateField("publicId", null);
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

    // Validar todos los campos
    const fieldsToValidate = Object.keys(formData) as Array<
      keyof typeof formData
    >;
    let hasErrors = false;

    fieldsToValidate.forEach((key) => {
      validateField(key, formData[key]);
      if (errors[key]) {
        hasErrors = true;
      }
    });

    // Validación específica para imágenes
    if (!pkg) {
      // Para creación, necesitamos imagen obligatoriamente
      if (
        formData.source === "local" &&
        (!formData.file || formData.file.size === 0)
      ) {
        setErrors((prev) => ({ ...prev, file: "Debe seleccionar una imagen" }));
        hasErrors = true;
      } else if (
        formData.source === "cloudinary" &&
        (!formData.publicId || formData.publicId.trim() === "")
      ) {
        setErrors((prev) => ({
          ...prev,
          publicId: "Debe seleccionar una imagen de Cloudinary",
        }));
        hasErrors = true;
      }
    }

    if (hasErrors) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    const submitData = {
      id: formData.id,
      title: formData.title,
      description: formData.description,
      price: formData.price || 0,
      imageUrl: formData.imageUrl || "",
      isActive: formData.isActive,
      showPrice: formData.showPrice,
      features: formData.features.filter((f) => f.trim() !== ""),
      file: formData.file,
      publicId: formData.publicId || null,
    };

    try {
      onSubmit(submitData);
    } catch (error) {
      console.error("Error in form submission:", error);
      showAlert("error", "Error al procesar el paquete", 4000);
    }
  };

  const selectedCloudinaryImage = formData.publicId
    ? cloudinaryImages.find((img) => img.public_id === formData.publicId)
    : null;

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
          Fuente de la imagen
        </label>
        <select
          value={formData.source}
          onChange={handleSourceChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          <option value="local">Subir desde equipo</option>
          <option value="cloudinary">Seleccionar desde Cloudinary</option>
        </select>
      </div>

      {formData.source === "local" && (
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
      )}

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
            <p className="mt-1 text-sm text-red-600">{errors.publicId}</p>
          )}
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
