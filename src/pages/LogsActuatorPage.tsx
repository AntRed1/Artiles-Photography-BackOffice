import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchLogs,
  deleteLogsBefore,
  fetchActuatorData,
} from "../services/logsActuatorService";
import type { LogsResponse, HttpLog, ActuatorResponse } from "../types/logs";
import { useAlert } from "../components/common/AlertManager";
import ErrorBoundary from "../components/common/ErrorBoundary";
import { X, Search, Trash2, Loader2, ChevronDown } from "lucide-react";

// Componente reutilizable para inputs de filtros
const FilterInput: React.FC<{
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}> = ({ name, placeholder, value, onChange, type = "text" }) => (
  <div className="relative">
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-4 py-2 sm:py-3 border border-cream-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-xs sm:text-sm font-medium text-gray-900 bg-white"
    />
    <Search className="absolute left-3 top-2.5 sm:top-3.5 h-4 w-4 text-gray-400" />
  </div>
);

// Componente reutilizable para botones
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}> = ({ children, onClick, disabled, className, variant = "primary" }) => {
  const baseStyles =
    "flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors";
  const variantStyles = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50",
    secondary:
      "bg-cream-100 text-gray-900 hover:bg-cream-200 disabled:opacity-50",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:opacity-50",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

// Componente reutilizable para tarjetas
const Card: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-cream-100 animate-slide-up">
    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
      {title}
    </h3>
    {children}
  </div>
);

// Componente para los detalles del log
const LogDetails: React.FC<{ log: HttpLog }> = ({ log }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="text-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-orange-500 hover:text-orange-600 font-medium"
        aria-expanded={isOpen}
        aria-controls={`details-${log.id}`}
      >
        <span>{isOpen ? "Ocultar" : "Ver"}</span>
        <ChevronDown
          className={`h-4 w-4 ml-1 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div
          id={`details-${log.id}`}
          className="mt-2 bg-cream-50 p-4 rounded-lg animate-slide-up text-xs sm:text-sm max-w-full overflow-auto"
        >
          <div className="grid gap-2">
            <p>
              <strong className="font-medium text-gray-900">Query:</strong>{" "}
              <span className="text-gray-600">
                {log.queryString || "Ninguno"}
              </span>
            </p>
            <p>
              <strong className="font-medium text-gray-900">
                Cuerpo Solicitud:
              </strong>{" "}
              <span className="text-gray-600">
                {log.requestBody || "Ninguno"}
              </span>
            </p>
            <p>
              <strong className="font-medium text-gray-900">
                Cuerpo Respuesta:
              </strong>{" "}
              <span className="text-gray-600">
                {log.responseBody || "Ninguno"}
              </span>
            </p>
            <p>
              <strong className="font-medium text-gray-900">
                Tipo Contenido:
              </strong>{" "}
              <span className="text-gray-600">
                {log.contentType || "Ninguno"}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const LogsActuatorPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [logs, setLogs] = useState<HttpLog[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    method: "",
    uri: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [deleteBefore, setDeleteBefore] = useState("");
  const [actuatorData, setActuatorData] = useState<ActuatorResponse>({
    health: { status: "LOADING" },
    info: {},
    metrics: { names: [] },
  });
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingActuator, setIsLoadingActuator] = useState(false);

  const fetchLogsData = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const response: LogsResponse = await fetchLogs({
        page: currentPage,
        size: 20,
        sort: "timestamp,desc",
        method: filters.method,
        uri: filters.uri,
        status: filters.status ? Number(filters.status) : undefined,
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      setLogs(response.logs);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error) {
      showAlert(
        "error",
        error instanceof Error ? error.message : "Error al obtener los logs"
      );
    } finally {
      setIsLoadingLogs(false);
    }
  }, [currentPage, filters, showAlert]);

  const fetchActuator = useCallback(async () => {
    setIsLoadingActuator(true);
    try {
      const data: ActuatorResponse = await fetchActuatorData();
      setActuatorData(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al obtener datos de actuator";
      showAlert("error", message);
      setActuatorData({
        health: { status: "ERROR" },
        info: { error: message },
        metrics: { names: [] },
      });
    } finally {
      setIsLoadingActuator(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchLogsData();
    fetchActuator();
  }, [fetchLogsData, fetchActuator]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      method: "",
      uri: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(0);
    showAlert("success", "Filtros limpiados correctamente");
  };

  const handleDeleteBefore = async () => {
    if (!deleteBefore) {
      showAlert("warning", "Por favor, selecciona una fecha");
      return;
    }
    try {
      const response = await deleteLogsBefore(deleteBefore);
      showAlert("success", response.message);
      fetchLogsData();
      setDeleteBefore("");
    } catch (error) {
      showAlert(
        "error",
        error instanceof Error ? error.message : "Error al eliminar logs"
      );
    }
  };

  // Memoizar la representación de los logs
  const logsContent = useMemo(
    () => (
      <div className="space-y-4 sm:space-y-0">
        {/* Table for medium and larger screens */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-cream-100">
            <thead className="bg-cream-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URI
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-cream-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                    {log.id}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                    {log.method}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 truncate min-w-0 max-w-[150px] sm:max-w-xs">
                    {log.uri}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                    {log.status}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <LogDetails log={log} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Card layout for mobile screens */}
        <div className="sm:hidden space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-cream-100"
            >
              <div className="grid gap-2 text-xs">
                <p>
                  <strong className="font-medium text-gray-900">ID:</strong>{" "}
                  {log.id}
                </p>
                <p>
                  <strong className="font-medium text-gray-900">Método:</strong>{" "}
                  {log.method}
                </p>
                <p className="truncate">
                  <strong className="font-medium text-gray-900">URI:</strong>{" "}
                  {log.uri}
                </p>
                <p>
                  <strong className="font-medium text-gray-900">Estado:</strong>{" "}
                  {log.status}
                </p>
                <p>
                  <strong className="font-medium text-gray-900">Fecha:</strong>{" "}
                  {new Date(log.timestamp).toLocaleString()}
                </p>
                <div>
                  <strong className="font-medium text-gray-900 block mb-1">
                    Detalles:
                  </strong>
                  <LogDetails log={log} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    [logs]
  );

  return (
    <ErrorBoundary>
      <div className="p-4 sm:p-6 bg-cream-50 min-h-screen">
        {/* Sección de Logs */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Gestión de Logs
          </h2>
          <Card title="Filtros">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <FilterInput
                name="method"
                placeholder="Método (ej. GET)"
                value={filters.method}
                onChange={handleFilterChange}
              />
              <FilterInput
                name="uri"
                placeholder="URI (ej. /api/services)"
                value={filters.uri}
                onChange={handleFilterChange}
              />
              <FilterInput
                name="status"
                placeholder="Estado (ej. 200)"
                value={filters.status}
                onChange={handleFilterChange}
                type="number"
              />
              <FilterInput
                name="startDate"
                placeholder="Fecha Inicio"
                value={filters.startDate}
                onChange={handleFilterChange}
                type="datetime-local"
              />
              <FilterInput
                name="endDate"
                placeholder="Fecha Fin"
                value={filters.endDate}
                onChange={handleFilterChange}
                type="datetime-local"
              />
              <Button variant="secondary" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-1 sm:mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </Card>
          <Card title="Eliminar Logs Anteriores">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <input
                type="datetime-local"
                value={deleteBefore}
                onChange={(e) => setDeleteBefore(e.target.value)}
                className="w-full sm:w-auto p-2 sm:p-3 border border-cream-100 rounded-lg text-xs sm:text-sm font-medium text-gray-900 bg-white"
              />
              <Button variant="danger" onClick={handleDeleteBefore}>
                <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                Eliminar
              </Button>
            </div>
          </Card>
          <Card title="Registros">
            {isLoadingLogs ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 sm:h-8 w-6 sm:w-8 animate-spin text-orange-500" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-gray-600 text-center py-4 text-sm">
                No se encontraron registros
              </p>
            ) : (
              logsContent
            )}
          </Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-cream-100 mt-4">
            <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0">
              Mostrando {currentPage * 20 + 1} a{" "}
              {Math.min((currentPage + 1) * 20, totalItems)} de {totalItems}{" "}
              elementos
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-2 sm:px-3 py-1"
              >
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  variant={currentPage === i ? "primary" : "secondary"}
                  className="px-2 sm:px-3 py-1"
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="px-2 sm:px-3 py-1"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </section>

        {/* Sección de Actuator */}
        <section>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Panel de Actuator
          </h2>
          {isLoadingActuator ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 sm:h-8 w-6 sm:w-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card title="Salud">
                <pre className="text-xs sm:text-sm text-gray-600 bg-cream-50 p-4 rounded-lg overflow-auto max-h-64 sm:max-h-96 font-mono">
                  {JSON.stringify(actuatorData.health, null, 2)}
                </pre>
              </Card>
              <Card title="Información">
                <pre className="text-xs sm:text-sm text-gray-600 bg-cream-50 p-4 rounded-lg overflow-auto max-h-64 sm:max-h-96 font-mono">
                  {JSON.stringify(actuatorData.info, null, 2)}
                </pre>
              </Card>
              <Card title="Métricas">
                <pre className="text-xs sm:text-sm text-gray-600 bg-cream-50 p-4 rounded-lg overflow-auto max-h-64 sm:max-h-96 font-mono">
                  {JSON.stringify(actuatorData.metrics, null, 2)}
                </pre>
              </Card>
            </div>
          )}
        </section>
      </div>
    </ErrorBoundary>
  );
};

export default LogsActuatorPage;
