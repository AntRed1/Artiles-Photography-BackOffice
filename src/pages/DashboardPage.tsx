import React, { useEffect, useState, useCallback, memo } from "react";
import { debounce } from "../utils/debounce";
import { getFromCache, setInCache } from "../utils/cache";
import {
  fetchCloudinaryMetrics,
  fetchCloudinaryImages,
  deleteCloudinaryImage,
  type CloudinaryMetric,
  type CloudinaryResource,
  type CloudinaryImagesResponse,
} from "../services/cloudinaryService";
import { ApiError } from "../services/api";
import { useAlert } from "../components/common/AlertManager";
import Modal from "../components/common/Modal";
import ActivityChart from "../components/dashboard/ActivityChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import { useRealTime } from "../context/RealTimeContext";

// Constantes de configuración
const CONFIG = {
  CACHE_EXPIRY_MS: {
    REAL_TIME: 60_000, // 1 minuto
    NORMAL: 300_000, // 5 minutos
  },
  PAGE_SIZE: 10,
  REAL_TIME_INTERVAL_MS: 60_000, // 1 minuto
  DEBOUNCE_MS: 500,
};

/**
 * Componente principal del dashboard para mostrar métricas y galería de Cloudinary.
 * @returns JSX.Element
 */
const DashboardPage: React.FC = memo(() => {
  const [cloudinaryMetrics, setCloudinaryMetrics] =
    useState<CloudinaryMetric | null>(null);
  const [images, setImages] = useState<CloudinaryResource[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    publicId: string | null;
  }>({ isOpen: false, publicId: null });
  const [cloudinaryRateLimit, setCloudinaryRateLimit] = useState(false);
  const { isRealTime, toggleRealTime } = useRealTime();
  const { showAlert } = useAlert();

  const cacheExpiryMs = isRealTime
    ? CONFIG.CACHE_EXPIRY_MS.REAL_TIME
    : CONFIG.CACHE_EXPIRY_MS.NORMAL;

  /**
   * Carga métricas e imágenes de Cloudinary, con manejo de caché y errores.
   */
  const loadData = useCallback(
    debounce(async () => {
      setIsLoading(true);
      try {
        // Cargar métricas
        const metricsCacheKey = `cloudinary_metrics_${isRealTime}`;
        let metrics = getFromCache<CloudinaryMetric>(metricsCacheKey);

        if (!cloudinaryRateLimit && !metrics) {
          metrics = await fetchCloudinaryMetrics();
          setInCache(metricsCacheKey, metrics, cacheExpiryMs);
        }

        if (metrics) {
          setCloudinaryMetrics(metrics);
        }

        // Cargar imágenes
        const imagesCacheKey = `cloudinary_images_${currentPage}_${CONFIG.PAGE_SIZE}`;
        let imagesResponse =
          getFromCache<CloudinaryImagesResponse>(imagesCacheKey);

        if (!imagesResponse) {
          imagesResponse = await fetchCloudinaryImages(
            currentPage,
            CONFIG.PAGE_SIZE
          );
          setInCache(imagesCacheKey, imagesResponse, cacheExpiryMs);
        }

        setImages(imagesResponse.images);
        setTotalPages(Math.ceil(imagesResponse.totalCount / CONFIG.PAGE_SIZE));
        setCloudinaryRateLimit(false);
      } catch (err: unknown) {
        let errorMessage = "Error al cargar datos de Cloudinary.";
        if (err instanceof ApiError) {
          errorMessage = err.message;
          if (err.status === 429) {
            errorMessage =
              "Límite de tasa de Cloudinary excedido. Por favor, espera o actualiza tu plan.";
            setCloudinaryRateLimit(true);
          } else if (err.status === 401) {
            errorMessage = "Sesión expirada. Inicia sesión nuevamente.";
          } else if (err.status === 0) {
            errorMessage = "Error de red. Verifica la conexión.";
          }
        }
        showAlert("error", errorMessage);
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    }, CONFIG.DEBOUNCE_MS),
    [currentPage, showAlert, cloudinaryRateLimit, cacheExpiryMs, isRealTime]
  );

  /**
   * Confirma la eliminación de una imagen en Cloudinary.
   */
  const confirmDeleteImage = async () => {
    if (!deleteModal.publicId) return;

    try {
      await deleteCloudinaryImage(deleteModal.publicId);
      await loadData();
      showAlert("success", "Imagen eliminada correctamente.");
      setCloudinaryRateLimit(false);
    } catch (err: unknown) {
      let errorMessage = "Error al eliminar la imagen.";
      if (err instanceof ApiError) {
        errorMessage = err.message;
        if (err.status === 401) {
          errorMessage = "Sesión expirada. Inicia sesión nuevamente.";
        } else if (err.status === 403) {
          errorMessage =
            "Acceso denegado. Solo administradores pueden eliminar imágenes.";
        } else if (err.status === 429) {
          errorMessage =
            "Límite de tasa de Cloudinary excedido. Por favor, espera.";
          setCloudinaryRateLimit(true);
        }
      }
      showAlert("error", errorMessage);
      console.error("Error deleting image:", err);
    } finally {
      setDeleteModal({ isOpen: false, publicId: null });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUploadSubmit = () => {
    // Aquí iría la lógica para subir imágenes al backend
    showAlert("info", "Funcionalidad de carga en desarrollo.");
    setUploadModalOpen(false);
  };

  useEffect(() => {
    loadData();
    let intervalId: NodeJS.Timeout | null = null;
    if (isRealTime) {
      intervalId = setInterval(loadData, CONFIG.REAL_TIME_INTERVAL_MS);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [loadData, isRealTime]);

  if (isLoading && !isRealTime) {
    return (
      <div
        className="max-w-7xl mx-auto p-6 animate-pulse"
        role="status"
        aria-live="polite"
      >
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
          ))}
        </div>
        <div className="bg-gray-200 h-64 rounded-xl mb-8"></div>
        <div className="bg-gray-200 h-96 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Panel de Control - Artiles Photography
        </h1>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          disabled={cloudinaryRateLimit}
          aria-label="Subir nueva imagen"
        >
          <i className="fas fa-upload mr-2" aria-hidden="true"></i>
          Subir Imagen
        </button>
      </header>

      {/* Modal para eliminar imagen */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, publicId: null })}
        title="Confirmar Eliminación"
        size="sm"
        primaryAction={{
          label: "Eliminar",
          onClick: confirmDeleteImage,
        }}
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setDeleteModal({ isOpen: false, publicId: null }),
        }}
      >
        <p className="text-sm text-gray-600">
          ¿Estás seguro de que deseas eliminar la imagen "{deleteModal.publicId}
          "? Esta acción es irreversible.
        </p>
      </Modal>

      {/* Modal para subir imagen */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Subir Nueva Imagen"
        size="md"
        primaryAction={{
          label: "Subir",
          onClick: handleUploadSubmit,
        }}
        secondaryAction={{
          label: "Cancelar",
          onClick: () => setUploadModalOpen(false),
        }}
      >
        <div className="text-sm text-gray-600">
          <p>Selecciona una imagen para subir a Cloudinary.</p>
          <input
            type="file"
            accept="image/*"
            className="mt-4 w-full border rounded p-2"
            disabled={cloudinaryRateLimit}
            aria-label="Seleccionar imagen para subir"
          />
          <p className="mt-2 text-xs text-gray-500">
            Nota: La funcionalidad de carga está en desarrollo.
          </p>
        </div>
      </Modal>

      <section className="mb-8 bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <label className="flex items-center gap-2 text-gray-700 text-base">
          <input
            type="checkbox"
            checked={isRealTime}
            onChange={(e) => toggleRealTime(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            disabled={cloudinaryRateLimit}
            aria-label="Activar actualización en tiempo real"
          />
          Actualización en tiempo real
        </label>
      </section>

      {isRealTime && isLoading && (
        <div
          className="text-center p-2 text-gray-600 text-sm animate-pulse"
          role="status"
        >
          Actualizando datos en tiempo real...
        </div>
      )}

      {/* Métricas clave */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: "Imágenes",
            value: cloudinaryMetrics?.totalImages.toLocaleString() ?? "0",
            icon: "fa-image",
            color: "blue",
            tooltip: "Total de imágenes almacenadas en Cloudinary",
          },
          {
            title: "Almacenamiento",
            value: cloudinaryMetrics?.storageUsageBytes
              ? `${(
                  cloudinaryMetrics.storageUsageBytes /
                  (1024 * 1024)
                ).toFixed(2)} MB`
              : "0 MB",
            icon: "fa-hdd",
            color: "gray",
            tooltip: "Espacio utilizado en Cloudinary",
          },
          {
            title: "Transformaciones",
            value:
              cloudinaryMetrics?.transformationCount.toLocaleString() ?? "0",
            icon: "fa-magic",
            color: "purple",
            tooltip: "Número total de transformaciones aplicadas",
          },
        ].map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow relative group"
            role="region"
            aria-label={`Métrica: ${metric.title}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  {metric.title}
                </p>
                <h2 className="text-2xl font-semibold text-gray-900 mt-1">
                  {metric.value}
                </h2>
              </div>
              <div className={`bg-${metric.color}-50 p-3 rounded-full`}>
                <i
                  className={`fas ${metric.icon} text-${metric.color}-600 text-xl`}
                  aria-hidden="true"
                ></i>
              </div>
            </div>
            <span className="text-gray-600 text-sm mt-4 block">
              En Cloudinary
            </span>
            <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 -top-10 left-1/2 transform -translate-x-1/2 z-10">
              {metric.tooltip}
            </div>
          </div>
        ))}
      </section>

      {/* Tendencias y actividad reciente */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <ActivityChart trendData={cloudinaryMetrics?.trendData || []} />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <RecentActivity images={images} />
        </div>
      </section>

      {/* Galería de imágenes */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Galería de Imágenes
          </h2>
          <span className="text-sm text-gray-500">
            Mostrando {images.length} de {cloudinaryMetrics?.totalImages ?? 0}{" "}
            imágenes
          </span>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border rounded-lg p-2">
                <div className="w-full h-32 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded mt-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mt-2 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : images.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.public_id}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                  role="region"
                  aria-label={`Imagen ${image.public_id}`}
                >
                  {image.secure_url ? (
                    <img
                      src={image.secure_url}
                      alt={`Vista previa de ${image.public_id}`}
                      className="w-full h-32 object-cover rounded-lg"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500">
                      Sin vista previa
                    </div>
                  )}
                  <p
                    className="text-sm text-gray-900 truncate mt-2"
                    title={image.public_id}
                  >
                    {image.public_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(image.created_at).toLocaleString()}
                  </p>
                  <button
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        publicId: image.public_id,
                      })
                    }
                    className="mt-2 text-sm text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                    aria-label={`Eliminar imagen ${image.public_id}`}
                    disabled={cloudinaryRateLimit}
                  >
                    <i className="fas fa-trash-alt mr-1" aria-hidden="true"></i>
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="px-3 py-1 rounded-lg text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                aria-label="Página anterior"
              >
                Anterior
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + Math.max(1, currentPage - 2);
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    aria-label={`Ir a la página ${page}`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="px-3 py-1 rounded-lg text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-4 text-gray-500 text-sm">
            No hay imágenes disponibles.
          </div>
        )}
      </section>
    </div>
  );
});

export default DashboardPage;
