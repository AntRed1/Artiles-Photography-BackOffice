import React, { useState } from "react";
import { useAlert } from "../components/common/AlertManager";
import {
  startGoogleAuth,
  signOutGoogle,
  getCalendarEvents,
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  importGoogleEvents,
} from "../services/appointmentService";
import type { GoogleCalendarEvent } from "../types/googlecalendarevent";
import type { Appointment } from "../types/appointment";
import { format, parseISO } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faSignOutAlt,
  faPlus,
  faEdit,
  faTrash,
  faSync,
} from "@fortawesome/free-solid-svg-icons";

const GoogleCalendarPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [email, setEmail] = useState("");
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGoogleEvents, setShowGoogleEvents] = useState(false);
  const [appointment, setAppointment] = useState({
    title: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    clientName: "",
    clientEmail: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchEvents = async () => {
    if (!email) {
      showAlert("error", "Por favor, ingrese un email válido", 3000);
      return;
    }
    setLoading(true);
    try {
      const [googleEvents, localAppointments] = await Promise.all([
        getCalendarEvents(email),
        getAppointments(
          new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
          new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
        ),
      ]);
      setEvents(googleEvents);
      setAppointments(localAppointments.filter((appt) => appt.clientEmail === email));
      showAlert("success", "Eventos y citas cargados exitosamente", 3000);
    } catch (error) {
      console.error("[fetchEvents] Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message.includes("Credenciales no encontradas")
            ? "Por favor, autentica este correo con Google primero."
            : error.message
          : "Error al cargar eventos. Verifica la conexión.";
      showAlert("error", errorMessage, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email) {
      showAlert("error", "Por favor, ingrese un email válido", 3000);
      return;
    }
    setLoading(true);
    try {
      const url = await startGoogleAuth(email);
      const popup = window.open(
        url,
        "GoogleAuth",
        "width=600,height=600,menubar=no,toolbar=no,scrollbars=yes"
      );
      if (!popup) {
        throw new Error("No se pudo abrir la ventana emergente. Verifica la configuración del navegador.");
      }
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === "GOOGLE_AUTH_SUCCESS" && event.data.email === email) {
          showAlert("success", "Autenticación con Google completada", 3000);
          setLoading(false);
          window.removeEventListener("message", handleMessage);
        } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
          showAlert("error", event.data.message || "Error en la autenticación con Google", 3000);
          setLoading(false);
          window.removeEventListener("message", handleMessage);
        }
      };
      window.addEventListener("message", handleMessage);
      const popupInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupInterval);
          window.removeEventListener("message", handleMessage);
          setLoading(false);
          showAlert("info", "Autenticación cancelada", 3000);
        }
      }, 500);
    } catch (error) {
      showAlert("error", error instanceof Error ? error.message : "Error al iniciar autenticación", 3000);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!email) {
      showAlert("error", "Por favor, ingrese un email válido", 3000);
      return;
    }
    setLoading(true);
    try {
      await signOutGoogle(email);
      setEvents([]);
      setAppointments([]);
      setEmail("");
      showAlert("success", "Sesión de Google cerrada exitosamente", 3000);
    } catch (error) {
      showAlert("error", error instanceof Error ? error.message : "Error al cerrar sesión", 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !appointment.title || !appointment.startTime || !appointment.endTime || !appointment.clientName) {
      showAlert("error", "Por favor, complete todos los campos requeridos", 3000);
      return;
    }
    setLoading(true);
    try {
      const appointmentData = {
        ...appointment,
        clientEmail: email,
        startTime: new Date(appointment.startTime).toISOString(),
        endTime: new Date(appointment.endTime).toISOString(),
        reminderSent: false,
      };
      if (editingId) {
        await updateAppointment(editingId, appointmentData, email);
        showAlert("success", "Cita actualizada exitosamente", 3000);
        setEditingId(null);
      } else {
        await createAppointment(appointmentData, email);
        showAlert("success", "Cita creada exitosamente", 3000);
      }
      setAppointment({
        title: "",
        description: "",
        location: "",
        startTime: "",
        endTime: "",
        clientName: "",
        clientEmail: "",
      });
      fetchEvents();
    } catch (error) {
      showAlert("error", error instanceof Error ? error.message : "Error al guardar cita", 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAppointment = (appt: Appointment) => {
    setEditingId(appt.id);
    setAppointment({
      title: appt.title,
      description: appt.description || "",
      location: appt.location || "",
      startTime: format(parseISO(appt.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(parseISO(appt.endTime), "yyyy-MM-dd'T'HH:mm"),
      clientName: appt.clientName,
      clientEmail: appt.clientEmail,
    });
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta cita?")) return;
    setLoading(true);
    try {
      await deleteAppointment(id);
      showAlert("success", "Cita eliminada exitosamente", 3000);
      fetchEvents();
    } catch (error) {
      showAlert("error", error instanceof Error ? error.message : "Error al eliminar cita", 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleImportEvents = async () => {
    if (!email) {
      showAlert("error", "Por favor, ingrese un email válido", 3000);
      return;
    }
    setLoading(true);
    try {
      await importGoogleEvents(email);
      showAlert("success", "Eventos importados exitosamente", 3000);
      fetchEvents();
    } catch (error) {
      showAlert("error", error instanceof Error ? error.message : "Error al importar eventos", 3000);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoogleEvents = () => {
    setShowGoogleEvents(!showGoogleEvents);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 mr-3" />
          Google Calendar
        </h2>
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email para autenticación</label>
          <div className="flex items-center mt-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              placeholder="Ingrese el email"
            />
            <button
              onClick={handleAuth}
              className="ml-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
              disabled={loading}
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 1 1 8-8v8a8 8 0 1 1-8 8 8 8 0 1 1-8-8z" />
                </svg>
              )}
              <span>Autenticar</span>
            </button>
            <button
              onClick={handleSignOut}
              className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">
            {editingId ? "Editar Cita" : "Crear Nueva Cita"}
          </h3>
          <form onSubmit={handleCreateOrUpdateAppointment} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={appointment.title}
                onChange={(e) => setAppointment({ ...appointment, title: e.target.value })}
                className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Título de la cita"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
              <input
                type="text"
                value={appointment.clientName}
                onChange={(e) => setAppointment({ ...appointment, clientName: e.target.value })}
                className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nombre del cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input
                type="text"
                value={appointment.location}
                onChange={(e) => setAppointment({ ...appointment, location: e.target.value })}
                className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ubicación"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
              <input
                type="datetime-local"
                value={appointment.startTime}
                onChange={(e) => setAppointment({ ...appointment, startTime: e.target.value })}
                className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
              <input
                type="datetime-local"
                value={appointment.endTime}
                onChange={(e) => setAppointment({ ...appointment, endTime: e.target.value })}
                className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={appointment.description}
                onChange={(e) => setAppointment({ ...appointment, description: e.target.value })}
                className="border border-gray-200 rounded-lg w-full text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
                placeholder="Descripción de la cita"
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
              disabled={loading}
            >
              <FontAwesomeIcon icon={editingId ? faEdit : faPlus} className="mr-1" />
              <span>{editingId ? "Actualizar Cita" : "Crear Cita"}</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setAppointment({
                    title: "",
                    description: "",
                    location: "",
                    startTime: "",
                    endTime: "",
                    clientName: "",
                    clientEmail: "",
                  });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105"
              >
                <span>Cancelar</span>
              </button>
            )}
          </form>
        </div>
        <div className="mb-8 flex space-x-4">
          <button
            onClick={fetchEvents}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
            disabled={loading || !email}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 1 1 8-8v8a8 8 0 1 1-8 8 8 8 0 1 1-8-8z" />
              </svg>
            )}
            <span>Cargar Eventos</span>
          </button>
          <button
            onClick={handleImportEvents}
            className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
            disabled={loading || !email}
          >
            <span>Importar Eventos de Google</span>
          </button>
          <button
            onClick={toggleGoogleEvents}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-transform hover:scale-105 disabled:opacity-50"
            disabled={loading || !email}
          >
            <FontAwesomeIcon icon={faSync} className="mr-1" />
            <span>{showGoogleEvents ? "Mostrar Citas Locales" : "Mostrar Eventos de Google"}</span>
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Nota: Los eventos sincronizados pueden recibir recordatorios automáticos según la configuración en la página de ajustes.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resumen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {showGoogleEvents
                ? events.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.summary}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.start?.dateTime
                          ? format(parseISO(event.start.dateTime), "dd/MM/yyyy HH:mm")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.end?.dateTime
                          ? format(parseISO(event.end.dateTime), "dd/MM/yyyy HH:mm")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">-</td>
                    </tr>
                  ))
                : appointments.map((appt) => (
                    <tr key={appt.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appt.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.clientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(parseISO(appt.startTime), "dd/MM/yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(parseISO(appt.endTime), "dd/MM/yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEditAppointment(appt)}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appt.id)}
                          className="text-red-600 hover:text-red-500"
                        >
                          <FontAwesomeIcon icon={faTrash} className="mr-1" />
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarPage;