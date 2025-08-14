/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback, useRef } from "react";
import validator from "validator";
import {
  fetchCloudinaryImages,
  type CloudinaryResource,
  type CloudinaryImagesResponse,
} from "../../services/cloudinaryService";
import {
  createImage,
  selectCloudinaryImage,
  updateImage,
} from "../../services/galleryService";
import type { GalleryItem } from "../../types/gallery";
import Alert from "../common/Alert";

// Interfaces para tipado estricto
interface FormData {
  file: File | null;
  title: string;
  description: string;
  type: "carousel" | "gallery";
  source: "local" | "cloudinary";
  publicId: string | null;
  imageUrl: string | null;
}

interface ImageFormProps {
  image: GalleryItem | null;
  onClose: () => void;
  onSubmit: (result: GalleryItem, action: "add" | "update") => void;
}

// Configuraciones constantes
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const CLOUDINARY_PAGE_SIZE = 20;
const MAX_IMAGES = 100;

const ImageForm: React.FC<ImageFormProps> = ({ image, onClose, onSubmit }) => {
  // Validar y normalizar type en la inicialización
  const initialType =
    image?.type === "carousel" || image?.type === "gallery"
      ? image.type
      : "gallery";

  const [formData, setFormData] = useState<FormData>({
    file: null,
    title: image?.title || "",
    description: image?.description || "",
    type: initialType,
    source: image?.publicId ? "cloudinary" : "local",
    publicId: image?.publicId || null,
    imageUrl: image
      ? image.type === "carousel"
        ? image.url ?? null
        : image.imageUrl ?? null
      : null,
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
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [cloudinaryImages, setCloudinaryImages] = useState<
    CloudinaryResource[]
  >([]);
  const [loadingCloudinary, setLoadingCloudinary] = useState(false);
  const [showCloudinaryGrid, setShowCloudinaryGrid] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const [usedCursors, setUsedCursors] = useState<Set<string>>(new Set());
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const isDev = process.env.NODE_ENV === "development";
  const log = useCallback(
    (...args: any[]) => {
      if (isDev) console.log(...args);
    },
    [isDev]
  );

  useEffect(() => {
    return () => {
      if (previewUrl && !image?.url && !image?.imageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, image]);

  const loadCloudinaryImages = useCallback(
    async (cursor: string | undefined = undefined, append: boolean = false) => {
      if (loadingCloudinary || (!cursor && !hasMoreImages)) {
        log(
          "[loadCloudinaryImages] Cancelado: ya está cargando o no hay más imágenes",
          {
            loadingCloudinary,
            hasMoreImages,
            cursor,
          }
        );
        return;
      }

      if (cursor && usedCursors.has(cursor)) {
        log("[loadCloudinaryImages] Cursor ya usado, cancelando", { cursor });
        return;
      }

      setLoadingCloudinary(true);
      try {
        log("[loadCloudinaryImages] Cargando imágenes", { cursor, append });
        const response: CloudinaryImagesResponse = await fetchCloudinaryImages(
          1,
          CLOUDINARY_PAGE_SIZE,
          cursor
        );

        setCloudinaryImages((prev) => {
          const newImages = response.images.filter(
            (newImg) =>
              !prev.some(
                (existingImg) => existingImg.public_id === newImg.public_id
              )
          );
          const updatedImages = append ? [...prev, ...newImages] : newImages;
          return updatedImages.slice(0, MAX_IMAGES);
        });

        setNextCursor(response.nextCursor);
        setHasMoreImages(
          response.nextCursor !== null && cloudinaryImages.length < MAX_IMAGES
        );

        if (cursor) {
          setUsedCursors((prev) => new Set(prev).add(cursor));
        }

        log("[loadCloudinaryImages] Éxito", {
          imageCount: response.images.length,
          uniqueImageCount: response.images.filter(
            (newImg) =>
              !cloudinaryImages.some(
                (existingImg) => existingImg.public_id === newImg.public_id
              )
          ).length,
          totalImages: append
            ? cloudinaryImages.length + response.images.length
            : response.images.length,
          nextCursor: response.nextCursor,
          totalCount: response.totalCount,
        });
      } catch (error) {
        let errorMessage = "No se pudieron cargar las imágenes de Cloudinary";
        if (error instanceof Error && error.message.includes("429")) {
          errorMessage =
            "Límite de tasa de Cloudinary excedido. Intenta de nuevo más tarde.";
        }
        setAlert({ type: "error", message: errorMessage });
        console.error("[loadCloudinaryImages] Error al cargar imágenes:", {
          error,
          cursor,
          append,
        });
      } finally {
        setLoadingCloudinary(false);
        setInitialLoadDone(true);
      }
    },
    [loadingCloudinary, hasMoreImages, usedCursors, log, cloudinaryImages]
  );

  useEffect(() => {
    let isMounted = true;
    if (
      formData.source === "cloudinary" &&
      showCloudinaryGrid &&
      isMounted &&
      !initialLoadDone
    ) {
      log("[useEffect] Iniciando carga de imágenes de Cloudinary");
      setCloudinaryImages([]);
      setUsedCursors(new Set());
      setNextCursor(null);
      setHasMoreImages(true);
      loadCloudinaryImages(undefined, false);
    } else if (!showCloudinaryGrid && initialLoadDone) {
      log("[useEffect] Cerrando galería, limpiando estado");
      setCloudinaryImages([]);
      setNextCursor(null);
      setHasMoreImages(true);
      setUsedCursors(new Set());
      setInitialLoadDone(false);
    }
    return () => {
      isMounted = false;
    };
  }, [
    formData.source,
    showCloudinaryGrid,
    initialLoadDone,
    loadCloudinaryImages,
    log,
  ]);

  useEffect(() => {
    if (
      !showCloudinaryGrid ||
      !hasMoreImages ||
      loadingCloudinary ||
      !nextCursor
    ) {
      log("[IntersectionObserver] No se configura observer", {
        showCloudinaryGrid,
        hasMoreImages,
        loadingCloudinary,
        nextCursor,
      });
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor) {
          log("[IntersectionObserver] Cargando más imágenes", { nextCursor });
          loadCloudinaryImages(nextCursor, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [
    showCloudinaryGrid,
    hasMoreImages,
    loadingCloudinary,
    nextCursor,
    loadCloudinaryImages,
    log,
  ]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!image) {
      if (formData.source === "local" && !formData.file) {
        newErrors.file = "Selecciona una imagen desde tu equipo";
      } else if (formData.source === "cloudinary") {
        if (!formData.publicId) {
          newErrors.publicId = "Selecciona una imagen de Cloudinary";
        }
        if (!formData.imageUrl) {
          newErrors.imageUrl =
            "La URL de la imagen de Cloudinary es obligatoria";
        } else if (!validator.isURL(formData.imageUrl)) {
          newErrors.imageUrl = "La URL de la imagen no es válida";
        }
      }
    }

    if (formData.type === "carousel" && !formData.title.trim()) {
      newErrors.title = "El título es obligatorio para imágenes de carrusel";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }

    if (formData.file) {
      if (!ALLOWED_IMAGE_TYPES.includes(formData.file.type)) {
        newErrors.file = "Solo se permiten imágenes JPEG, PNG o GIF";
      }
      if (formData.file.size > MAX_FILE_SIZE) {
        newErrors.file = "La imagen no debe superar los 5 MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, image]);

  const resetForm = useCallback(() => {
    setFormData({
      file: null,
      title: "",
      description: "",
      type: "gallery",
      source: "local",
      publicId: null,
      imageUrl: null,
    });
    if (previewUrl && !image?.url && !image?.imageUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrors({});
    setAlert(null);
    setShowCloudinaryGrid(false);
    setCloudinaryImages([]);
    setNextCursor(null);
    setHasMoreImages(true);
    setUsedCursors(new Set());
    setInitialLoadDone(false);
  }, [previewUrl, image]);

  const handleSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const source = e.target.value as "local" | "cloudinary";
      log("[handleSourceChange] Cambiando fuente", { source });
      setFormData({
        ...formData,
        source,
        file: null,
        publicId: null,
        imageUrl: null,
        type: formData.type || "gallery",
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
      setCloudinaryImages([]);
      setNextCursor(null);
      setHasMoreImages(true);
      setUsedCursors(new Set());
      setInitialLoadDone(false);
    },
    [formData, image, log]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null;
      if (file) {
        if (previewUrl && !image?.url && !image?.imageUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(URL.createObjectURL(file));
        setFormData({
          ...formData,
          file,
          publicId: null,
          imageUrl: null,
        });
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
          file: null,
          publicId: null,
          imageUrl: null,
        });
      }
      setErrors((prev) => ({ ...prev, file: "" }));
    },
    [formData, previewUrl, image]
  );

  const handleCloudinarySelect = useCallback(
    (publicId: string) => {
      if (publicId) {
        const selectedImage = cloudinaryImages.find(
          (img) => img.public_id === publicId
        );
        if (selectedImage?.secure_url) {
          setPreviewUrl(selectedImage.secure_url);
          setFormData({
            ...formData,
            publicId,
            imageUrl: selectedImage.secure_url,
            file: null,
          });
        } else {
          setErrors((prev) => ({
            ...prev,
            publicId: "La imagen seleccionada no tiene una URL válida",
          }));
          return;
        }
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
          imageUrl: null,
          file: null,
        });
      }
      setShowCloudinaryGrid(false);
      setErrors((prev) => ({ ...prev, publicId: "", imageUrl: "" }));
    },
    [cloudinaryImages, formData, image]
  );

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        let result: GalleryItem;

        log("[handleSubmit] Enviando formulario", { formData });

        if (image) {
          if (!formData.type) {
            throw new Error("El tipo es obligatorio");
          }
          result = await updateImage(image.id, {
            file: formData.file,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            publicId: formData.publicId || undefined,
            imageUrl: formData.imageUrl || undefined,
          });
          onSubmit(result, "update");
          setAlert({
            type: "success",
            message: "Imagen actualizada con éxito",
          });
        } else {
          if (formData.source === "local" && formData.file) {
            result = await createImage({
              file: formData.file,
              title: formData.title,
              description: formData.description,
              type: formData.type,
            });
          } else if (
            formData.source === "cloudinary" &&
            formData.publicId &&
            formData.imageUrl
          ) {
            result = await selectCloudinaryImage({
              publicId: formData.publicId,
              imageUrl: formData.imageUrl,
              title: formData.title,
              description: formData.description,
              type: formData.type,
            });
          } else {
            throw new Error("No se seleccionó ninguna imagen válida");
          }
          onSubmit(result, "add");
          setAlert({ type: "success", message: "Imagen creada con éxito" });
        }

        setTimeout(() => handleClose(), 1000);
      } catch (error) {
        let errorMessage = "Error desconocido al procesar la imagen";
        if (error instanceof Error) {
          if (error.message.includes("La URL de la imagen es obligatoria")) {
            errorMessage =
              "Por favor, selecciona una imagen válida de Cloudinary";
          } else if (error.message.includes("429")) {
            errorMessage =
              "Límite de tasa de Cloudinary excedido. Intenta de nuevo más tarde.";
          } else {
            errorMessage = error.message;
          }
        }
        setAlert({ type: "error", message: errorMessage });
        console.error("[handleSubmit] Error:", { error, formData });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, image, onSubmit, validateForm, handleClose, log]
  );

  const selectedCloudinaryImage = formData.publicId
    ? cloudinaryImages.find((img) => img.public_id === formData.publicId)
    : null;

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-6 space-y-6">
      {alert && (
        <Alert
          type={alert.type}
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
              accept={ALLOWED_IMAGE_TYPES.join(",")}
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
                onClick={() => {
                  log("[Ver galería] Cambiando showCloudinaryGrid", {
                    current: showCloudinaryGrid,
                    next: !showCloudinaryGrid,
                  });
                  setShowCloudinaryGrid(!showCloudinaryGrid);
                }}
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
                {loadingCloudinary && cloudinaryImages.length === 0 ? (
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
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                      {cloudinaryImages.map((img, index) => (
                        <div
                          key={`${img.public_id}-${index}`}
                          className={`relative cursor-pointer group transition-all duration-200 ${
                            formData.publicId === img.public_id
                              ? "ring-2 ring-indigo-500 ring-offset-2"
                              : "hover:ring-2 hover:ring-gray-300"
                          }`}
                          onClick={() => handleCloudinarySelect(img.public_id)}
                        >
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                            <img
                              src={`${img.secure_url}?w=100&h=100&c=fill`}
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
                      <div ref={loadMoreRef} className="h-4" />
                    </div>
                    {loadingCloudinary && cloudinaryImages.length > 0 && (
                      <div className="flex items-center justify-center py-4">
                        <svg
                          className="animate-spin h-6 w-6 text-indigo-600"
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
                    {!loadingCloudinary &&
                      hasMoreImages &&
                      cloudinaryImages.length < MAX_IMAGES && (
                        <button
                          type="button"
                          onClick={() =>
                            loadCloudinaryImages(nextCursor || undefined, true)
                          }
                          className="mt-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors w-full"
                          disabled={isSubmitting || loadingCloudinary}
                        >
                          Cargar más imágenes
                        </button>
                      )}
                    {!hasMoreImages && cloudinaryImages.length > 0 && (
                      <p className="mt-2 text-sm text-gray-500 text-center">
                        No hay más imágenes para cargar
                      </p>
                    )}
                    {cloudinaryImages.length >= MAX_IMAGES && (
                      <p className="mt-2 text-sm text-gray-500 text-center">
                        Límite máximo de imágenes alcanzado ({MAX_IMAGES})
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {(errors.publicId || errors.imageUrl) && (
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
                {errors.publicId || errors.imageUrl}
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

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
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
