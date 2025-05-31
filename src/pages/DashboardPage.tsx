import React, { useEffect, useState, useCallback } from "react";
import {
  fetchStats,
  fetchBreakdown,
  fetchBrowsers,
  fetchCities,
  fetchSources,
  fetchDevices,
  fetchEvents,
  fetchVisitors,
  type PlausibleBreakdown,
  type PlausibleStats,
  type BrowserVersion,
  type City,
  type PlausibleTimeseries,
  type PlausibleEvent,
  type SourceData,
  type DeviceData,
} from "../services/plausibleService";
import { useRealTime } from "../context/RealTimeContext";
import ActivityChart from "../components/dashboard/ActivityChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
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

const VALID_PERIODS = ["day", "7d", "30d", "month", "6mo", "12mo"];

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<PlausibleStats>({
    visitors: 0,
    pageviews: 0,
    bounce_rate: 0,
    visit_duration: 0,
  });
  const [topPages, setTopPages] = useState<PlausibleBreakdown[]>([]);
  const [browserData, setBrowserData] = useState<BrowserVersion[]>([]);
  const [cityData, setCityData] = useState<City[]>([]);
  const [visitorData, setVisitorData] = useState<PlausibleTimeseries[]>([]);
  const [eventData, setEventData] = useState<PlausibleEvent[]>([]);
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [cloudinaryMetrics, setCloudinaryMetrics] =
    useState<CloudinaryMetric | null>(null);
  const [images, setImages] = useState<CloudinaryResource[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [loadingImages, setLoadingImages] = useState(false);
  const [period, setPeriod] = useState<string>("day");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    publicId?: string | null;
  }>({ isOpen: false, publicId: null });
  const [cloudinaryRateLimit, setCloudinaryRateLimit] = useState(false);
  const { isRealTime, toggleRealTime } = useRealTime();
  const { showAlert } = useAlert();

  const loadData = useCallback(async () => {
    if (!VALID_PERIODS.includes(period)) {
      showAlert("error", "Período seleccionado no válido.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch Plausible data
      const [
        statsData,
        breakdownData,
        browsers,
        cities,
        sources,
        devices,
        events,
        visitors,
      ] = await Promise.all([
        fetchStats(period),
        fetchBreakdown(period),
        fetchBrowsers(period),
        fetchCities(period),
        fetchSources(period),
        fetchDevices(period),
        fetchEvents(period),
        fetchVisitors(period),
      ]);

      // Fetch Cloudinary metrics separately
      let cloudinaryData: CloudinaryMetric | null = null;
      if (!cloudinaryRateLimit) {
        try {
          cloudinaryData = await fetchCloudinaryMetrics();
        } catch (cloudinaryError) {
          console.warn("Failed to fetch Cloudinary metrics:", cloudinaryError);
          showAlert("warning", "No se pudieron cargar métricas de Cloudinary.");
        }
      }

      // Update state with Plausible data
      setStats(statsData);
      setTopPages(
        "results" in breakdownData && Array.isArray(breakdownData.results)
          ? breakdownData.results.filter(
              (page: PlausibleBreakdown): page is PlausibleBreakdown =>
                page.page != null &&
                page.visitors != null &&
                page.pageviews != null &&
                page.bounce_rate != null &&
                page.time_on_page != null &&
                page.scroll_depth != null
            )
          : []
      );
      setBrowserData(browsers);
      setCityData(cities);
      setVisitorData(visitors);
      setEventData(events);
      setSourceData(sources);
      setDeviceData(devices);

      // Update Cloudinary metrics if fetched
      if (cloudinaryData) {
        setCloudinaryMetrics(cloudinaryData);
      }
    } catch (err: unknown) {
      let errorMessage = "Error al cargar las estadísticas. Intenta de nuevo.";
      if (err instanceof ApiError) {
        if (err.message.includes("Error parsing `period`")) {
          errorMessage =
            "Período no válido. Por favor, selecciona un período diferente.";
        } else if (err.status === 429) {
          errorMessage =
            "Límite de tasa de Cloudinary excedido. Por favor, espera hasta el 27 de mayo de 2025 a las 01:00 UTC o actualiza tu plan de Cloudinary.";
          setCloudinaryRateLimit(true);
        } else if (err.message.includes("Cloudinary")) {
          errorMessage =
            "Error al cargar métricas de Cloudinary. Verifica la conexión con Cloudinary.";
        }
      }
      showAlert("error", errorMessage);
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, [period, showAlert, cloudinaryRateLimit]);

  const loadImages = useCallback(async () => {
    setLoadingImages(true);
    try {
      const response: CloudinaryImagesResponse = await fetchCloudinaryImages(
        currentPage,
        pageSize
      );
      setImages(response.images);
      setTotalPages(Math.ceil(response.totalCount / pageSize));
      setCloudinaryRateLimit(false); // Reset rate limit flag on success
    } catch (err: unknown) {
      let errorMessage = "Error al cargar imágenes de Cloudinary.";
      if (err instanceof ApiError) {
        errorMessage = err.message;
        if (err.status === 429) {
          errorMessage =
            "Límite de tasa de Cloudinary excedido. Por favor, espera hasta el próximo ciclo de datos.";
          setCloudinaryRateLimit(true);
        } else if (err.status === 401) {
          errorMessage =
            "Sesión expirada. Por favor, inicia sesión nuevamente.";
        } else if (err.status === 0) {
          errorMessage =
            "Error de red o CORS. Verifica la conexión o la configuración del servidor.";
        }
      }
      showAlert("error", errorMessage);
      console.error("[loadImages] Error:", err);
    } finally {
      setLoadingImages(false);
    }
  }, [currentPage, pageSize, showAlert]);

  const confirmDeleteImage = async () => {
    if (!modal.publicId) return;

    try {
      await deleteCloudinaryImage(modal.publicId);
      await loadImages(); // Refresh images
      const updatedMetrics = await fetchCloudinaryMetrics();
      setCloudinaryMetrics(updatedMetrics);
      setCloudinaryRateLimit(false);
      showAlert("success", "Imagen eliminada correctamente.");
    } catch (err: unknown) {
      let errorMessage = "Error al eliminar la imagen.";
      if (err instanceof ApiError) {
        errorMessage = err.message;
        if (err.status === 401) {
          errorMessage =
            "Sesión expirada. Por favor, inicia sesión nuevamente.";
        } else if (err.status === 403) {
          errorMessage =
            "Acceso denegado. Solo los administradores pueden eliminar imágenes.";
        } else if (err.status === 429) {
          errorMessage =
            "Límite de tasa de Cloudinary excedido. Por favor, espera hasta el 27 de mayo de 2025 a las 01:00 UTC o actualiza tu plan de Cloudinary.";
          setCloudinaryRateLimit(true);
        }
      }
      showAlert("error", errorMessage);
      console.error("Error deleting image:", err);
    } finally {
      setModal({ isOpen: false, publicId: null });
    }
  };

  const handleDeleteImage = (publicId: string) => {
    setModal({ isOpen: true, publicId });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    loadData();
    loadImages();
    let intervalId: NodeJS.Timeout | null = null;
    if (isRealTime) {
      intervalId = setInterval(() => {
        loadData();
        loadImages();
      }, 10000); // Update every 10 seconds
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loadData, loadImages, isRealTime]);

  if (loading && !isRealTime) {
    return (
      <div
        className="text-center p-6 text-gray-600"
        role="status"
        aria-live="polite"
      >
        Cargando estadísticas...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pacar-sm-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">
        Panel de Control - Artiles Photography
      </h1>

      {/* Modal para confirmar eliminación */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, publicId: null })}
        title="Confirmar Eliminación"
        size="sm"
        primaryAction={{
          label: "Eliminar",
          onClick: confirmDeleteImage,
        }}
        secondaryAction={{
          label: "Eliminar",
          onClick: () => setModal({ isOpen: false, publicId: null }),
        }}
      >
        <p className="text-sm">
          ¿Estás seguro de que deseas eliminar la imagen "{modal.publicId}"?
          Esta acción no se puede deshacer.
        </p>
      </Modal>

      {/* Selector de período y Real-Time Toggle */}
      <div className="mb-6 sm:mb-8 bg-white rounded-lg shadow-sm p-4 sm:flex-col sm:flex-row sm:items-center sm:p-4 justify-between gap-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="period"
            className="text-gray-700 font-medium text-sm sm:text-base"
          >
            Seleccionar período:
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-lg p-2 bg-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-sm sm:text-base"
            aria-describedby="description-period"
          >
            {VALID_PERIODS.map((p) => (
              <option key={p} value={p}>
                {p === "day"
                  ? "Últimas 24 horas"
                  : p === "7d"
                  ? "Últimos 7 días"
                  : p === "30d"
                  ? "Últimos 30 días"
                  : p === "month"
                  ? "Este mes"
                  : p === "6mo"
                  ? "Últimos 6 meses"
                  : "Últimos 12 meses"}
              </option>
            ))}
          </select>
        </div>
        {period === "day" && (
          <label className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
            <input
              type="checkbox"
              checked={isRealTime}
              onChange={(e) => toggleRealTime(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={cloudinaryRateLimit}
            />
            Actualización en tiempo real
          </label>
        )}
        <p id="description-period" className="text-sm text-gray-500">
          Selecciona el período para el análisis de estadísticas.
        </p>
      </div>

      {/* Indicador de Carga en Tiempo Real */}
      {isRealTime && loading && (
        <div className="text-center p-2 text-gray-600 text-sm animate-pulse">
          Actualizando datos en tiempo real...
        </div>
      )}

      {/* Métricas Clave incluyendo Cloudinary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                Visitantes únicos
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">
                {stats.visitors.toLocaleString()}
              </h2>
            </div>
            <div className="bg-indigo-50 p-2 sm:p-3 rounded-full">
              <i
                className="fas fa-users text-indigo-600 text-lg sm:text-xl"
                aria-hidden="true"
              ></i>
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-indigo-600 text-xs sm:text-sm">
              <i className="fas fa-arrow-up mr-1" aria-hidden="true"></i>
              Últimos {period === "day" ? "24 horas" : period}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                Imágenes y Videos
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">
                {cloudinaryMetrics?.totalImages.toLocaleString() ?? 0}
              </h2>
            </div>
            <div className="bg-blue-50 p-2 sm:p-3 rounded-full">
              <i
                className="fas fa-image text-blue-600 text-lg sm:text-xl"
                aria-hidden="true"
              ></i>
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-blue-600 text-xs sm:text-sm">
              Total en Cloudinary
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                Almacenamiento
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">
                {cloudinaryMetrics?.storageUsageBytes
                  ? (
                      cloudinaryMetrics.storageUsageBytes /
                      (1024 * 1024)
                    ).toFixed(2)
                  : "0"}{" "}
                MB
              </h2>
            </div>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-full">
              <i
                className="fas fa-hdd text-gray-600 text-lg sm:text-xl"
                aria-hidden="true"
              ></i>
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-gray-600 text-xs sm:text-sm">
              En Cloudinary
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                Transformaciones
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">
                {cloudinaryMetrics?.transformationCount.toLocaleString() ?? 0}
              </h2>
            </div>
            <div className="bg-purple-50 p-2 sm:p-3 rounded-full">
              <i
                className="fas fa-magic text-purple-600 text-lg sm:text-xl"
                aria-hidden="true"
              ></i>
            </div>
          </div>
          <div className="mt-2 sm:mt-4">
            <span className="text-purple-600 text-xs sm:text-sm">Total</span>
          </div>
        </div>
      </div>

      {/* Cloudinary Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Tendencias de Cloudinary (Últimos 5 días)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={cloudinaryMetrics?.trendData || []}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            aria-label="Gráfico de tendencias de Cloudinary"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString([], {
                  day: "numeric",
                  month: "short",
                })
              }
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === "transformations"
                  ? value.toLocaleString()
                  : `${value.toFixed(2)} MB`,
                name === "transformations"
                  ? "Transformaciones"
                  : "Almacenamiento",
              ]}
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString([], {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              }
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="transformations"
              stroke="#8b5cf6"
              name="Transformaciones"
              activeDot={{ r: 6 }}
              animationDuration={1000}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="storage"
              stroke="#3b82f6"
              name="Almacenamiento (MB)"
              activeDot={{ r: 6 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Visitantes por hora */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Visitantes por Hora
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={visitorData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            aria-label="Gráfico de visitantes por hora"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), ""]}
              labelFormatter={(label) =>
                new Date(label).toLocaleString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "numeric",
                  month: "short",
                })
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke="#3b82f6"
              name="Visitantes"
              activeDot={{ r: 6 }}
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="pageviews"
              stroke="#10b981"
              name="Vistas"
              activeDot={{ r: 6 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:col-span-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Actividad del Sitio
          </h2>
          <ActivityChart period={period} />
        </div>
        <RecentActivity period={period} />
      </div>

      {/* Galería de Imágenes */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Galería de Imágenes
        </h2>
        {loadingImages ? (
          <div className="text-center p-4 text-gray-600" role="status">
            Cargando imágenes...
          </div>
        ) : images.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-2 hover:shadow-md transition-shadow"
                >
                  {image.secure_url ? (
                    <img
                      src={image.secure_url}
                      alt={`Vista previa de ${image.public_id}`}
                      className="w-full h-32 object-cover rounded"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm">
                      Sin Vista
                    </div>
                  )}
                  <p className="text-sm truncate mt-2" title={image.public_id}>
                    {image.public_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(image.created_at).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleDeleteImage(image.public_id)}
                    className="text-red-600 hover:text-red-800 mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    aria-label={`Eliminar imagen ${image.public_id}`}
                    disabled={cloudinaryRateLimit}
                  >
                    <i className="fas fa-trash-alt mr-1" aria-hidden="true"></i>
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`mx-1 px-3 py-1 rounded text-sm ${
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    aria-label={`Ir a la página ${page}`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          </>
        ) : (
          <div className="text-center p-4 text-gray-500">
            No hay imágenes disponibles.
          </div>
        )}
      </div>

      {/* Eventos Personalizados */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Eventos Personalizados
        </h2>
        <div className="overflow-x-auto">
          <table
            className="min-w-full divide-y divide-gray-200"
            aria-label="Tabla de eventos personalizados"
          >
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Evento
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Conteo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {eventData.length > 0 ? (
                eventData.map((event, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event.name}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.count.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No hay eventos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Páginas Más Visitadas
        </h2>
        <div className="overflow-x-auto">
          <table
            className="min-w-full divide-y divide-gray-200"
            aria-label="Tabla de páginas más visitadas"
          >
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Página
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Visitantes
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Vistas
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tiempo en Página
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Profundidad de Desplazamiento
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPages.length > 0 ? (
                topPages.map((page, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {page.page || "Desconocido"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(page.visitors ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(page.pageviews ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.time_on_page ?? 0} seg
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {page.scroll_depth ?? 0}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No hay datos disponibles para este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visualizaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Navegadores
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={browserData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              aria-label="Gráfico de navegadores"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                formatter={(value: number) => [
                  value.toLocaleString(),
                  "Visitantes",
                ]}
              />
              <Legend />
              <Bar dataKey="visitors" fill="#3b82f6" animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Ciudades
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={cityData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              aria-label="Gráfico de ciudades"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                formatter={(value: number) => [
                  value.toLocaleString(),
                  "Visitantes",
                ]}
              />
              <Legend />
              <Bar dataKey="visitors" fill="#10b981" animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Fuentes de Tráfico
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={sourceData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              aria-label="Gráfico de fuentes de tráfico"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                formatter={(value: number) => [
                  value.toLocaleString(),
                  "Visitantes",
                ]}
              />
              <Legend />
              <Bar dataKey="visitors" fill="#f59e0b" animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Dispositivos
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={deviceData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              aria-label="Gráfico de dispositivos"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                formatter={(value: number) => [
                  value.toLocaleString(),
                  "Visitantes",
                ]}
              />
              <Legend />
              <Bar dataKey="visitors" fill="#ef4444" animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
