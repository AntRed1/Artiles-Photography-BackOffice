/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { utcToZonedTime, zonedTimeToUtc, formatInTimeZone } from "date-fns-tz";
import { useAlert } from "../components/common/AlertManager";
import { useRealTime } from "../context/RealTimeContext";
import {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  sendManualReminder,
  startGoogleAuth,
  signOutGoogle,
  getCalendarEvents,
  importGoogleEvents,
} from "../services/appointmentService";
import type { Appointment } from "../types/appointment";
import type { GoogleCalendarEvent } from "../types/googlecalendarevent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faSync,
  faTrash,
  faCalendarAlt,
  faSignOutAlt,
  faTimes,
  faFilter,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import "react-big-calendar/lib/css/react-big-calendar.css";

const TIME_ZONE = "America/Santo_Domingo";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  isGoogleEvent?: boolean;
  resource: Appointment | GoogleCalendarEvent;
}

const CustomEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  return (
    <motion.div
      className="flex items-center justify-between p-2 rounded-lg h-full w-full overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <span className="text-sm font-medium truncate flex-1">{event.title}</span>
      {event.isGoogleEvent && (
        <span className="text-xs bg-white text-red-600 rounded-full px-2 py-1 ml-2">
          Google
        </span>
      )}
    </motion.div>
  );
};

const AppointmentsPage: React.FC = () => {
  const { showAlert } = useAlert();
  const { subscribeToUpdates } = useRealTime();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [formData, setFormData] = useState<Partial<Appointment>>({
    title: "",
    startTime: "",
    endTime: "",
    clientName: "",
    clientEmail: "",
    location: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showGoogleEvents, setShowGoogleEvents] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
  });
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [clickCount, setClickCount] = useState<number>(0);

  const fetchAppointments = useCallback(
    async (loadGoogleEvents = false) => {
      console.log(
        "fetchAppointments called with loadGoogleEvents:",
        loadGoogleEvents
      );
      setLoading(true);
      try {
        const start =
          filters.startDate || subMonths(new Date(), 1).toISOString();
        const end = filters.endDate || addMonths(new Date(), 1).toISOString();
        console.log(`Fetching appointments from ${start} to ${end}`);
        const localAppointments = await getAppointments(start, end);
        console.log("Local appointments fetched:", localAppointments.length);

        let filteredAppointments = localAppointments;

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredAppointments = localAppointments.filter(
            (appt) =>
              appt.title.toLowerCase().includes(searchLower) ||
              appt.clientName.toLowerCase().includes(searchLower)
          );
        }

        if (email) {
          filteredAppointments = filteredAppointments.filter(
            (appt) => appt.clientEmail === email
          );
        }

        setAppointments(filteredAppointments);

        if (loadGoogleEvents && email) {
          try {
            const googleEvents = await getCalendarEvents(email);
            console.log("Google events fetched:", googleEvents);
            setGoogleEvents(googleEvents);
            showAlert("success", "Eventos de Google cargados", 3000);
          } catch (googleError) {
            console.error("Error fetching Google events:", googleError);
            showAlert("error", "Error al cargar eventos de Google", 3000);
          }
        }
      } catch (error) {
        console.error("Error in fetchAppointments:", error);
        showAlert(
          "error",
          error instanceof Error ? error.message : "Error al cargar datos",
          3000
        );
      } finally {
        setLoading(false);
      }
    },
    [email, showAlert, filters]
  );

  useEffect(() => {
    console.log("Initial fetchAppointments");
    fetchAppointments();
    const unsubscribe = subscribeToUpdates("day", () =>
      fetchAppointments(showGoogleEvents)
    );
    return () => unsubscribe();
  }, [fetchAppointments, showGoogleEvents, subscribeToUpdates]);

  const handleAuth = async () => {
    if (!email) {
      showAlert("error", "Por favor, ingrese un email válido", 3000);
      return;
    }
    setLoading(true);
    try {
      const url = await startGoogleAuth(email);
      console.log("Auth URL:", url);
      const popup = window.open(
        url,
        "GoogleAuth",
        "width=600,height=600,menubar=no,toolbar=no,scrollbars=yes"
      );
      if (!popup) {
        throw new Error("No se pudo abrir la ventana emergente.");
      }
      const handleMessage = (event: MessageEvent) => {
        console.log("Message received:", event.origin, event.data);
        if (
          event.data.type === "GOOGLE_AUTH_SUCCESS" &&
          event.data.email === email
        ) {
          console.log("Auth success for:", email);
          showAlert("success", "Autenticación con Google completada", 3000);
          fetchAppointments(true);
        } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
          console.error("Auth error:", event.data.message);
          showAlert(
            "error",
            event.data.message || "Error en autenticación",
            3000
          );
        }
        window.removeEventListener("message", handleMessage);
        setLoading(false);
      };
      window.addEventListener("message", handleMessage);
      const timer = setTimeout(() => {
        console.log("Auth timeout");
        setLoading(false);
        showAlert("error", "Tiempo de espera agotado para autenticación", 3000);
        window.removeEventListener("message", handleMessage);
      }, 60000);
      window.addEventListener(
        "message",
        () => {
          console.log("Clearing timeout");
          clearTimeout(timer);
        },
        { once: true }
      );
    } catch (error) {
      console.error("Error in handleAuth:", error);
      showAlert(
        "error",
        error instanceof Error ? error.message : "Error al autenticar",
        3000
      );
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
      setGoogleEvents([]);
      setEmail("");
      setShowGoogleEvents(false);
      showAlert("success", "Sesión de Google cerrada", 3000);
    } catch (error) {
      console.error("Error in handleSignOut:", error);
      showAlert(
        "error",
        error instanceof Error ? error.message : "Error al cerrar sesión",
        3000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !email ||
      !formData.title ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.clientName
    ) {
      showAlert("error", "Complete todos los campos requeridos", 3000);
      return;
    }
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      showAlert("error", "Fechas inválidas", 3000);
      return;
    }
    if (end <= start) {
      showAlert(
        "error",
        "La fecha de fin debe ser posterior a la de inicio",
        3000
      );
      return;
    }
    setLoading(true);
    try {
      // Depuración de fechas
      console.log("Submitting appointment:", {
        startTime: formData.startTime,
        endTime: formData.endTime,
        startZoned: formatInTimeZone(
          new Date(formData.startTime),
          TIME_ZONE,
          "dd/MM/yyyy HH:mm z"
        ),
        endZoned: formatInTimeZone(
          new Date(formData.endTime),
          TIME_ZONE,
          "dd/MM/yyyy HH:mm z"
        ),
      });

      const appointmentData: Omit<
        Appointment,
        "id" | "googleEventId" | "reminderSent"
      > = {
        title: formData.title,
        clientName: formData.clientName,
        clientEmail: email,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location || "",
        description: formData.description || "",
      };
      let updatedAppointment: Appointment;

      let isAuthenticated = false;
      try {
        await getCalendarEvents(email);
        isAuthenticated = true;
      } catch (authError) {
        console.warn("Usuario no autenticado con Google", authError);
        showAlert(
          "warning",
          "Por favor, autentica tu cuenta de Google para sincronizar",
          3000
        );
        await handleAuth();
        try {
          await getCalendarEvents(email);
          isAuthenticated = true;
        } catch (retryError) {
          console.error(
            "Fallo al verificar autenticación tras reintento",
            retryError
          );
          showAlert(
            "warning",
            "No se pudo autenticar con Google. La cita se guardará sin sincronizar.",
            3000
          );
        }
      }

      if (editingId) {
        updatedAppointment = await updateAppointment(
          editingId,
          { ...appointmentData, reminderSent: false },
          email
        );
        showAlert(
          "success",
          isAuthenticated
            ? "Cita actualizada y sincronizada con Google"
            : "Cita actualizada pero no sincronizada con Google",
          3000
        );
        setAppointments(
          appointments.map((appt) =>
            appt.id === editingId ? updatedAppointment : appt
          )
        );
      } else {
        updatedAppointment = await createAppointment(appointmentData, email);
        showAlert(
          "success",
          isAuthenticated
            ? "Cita creada y sincronizada con Google"
            : "Cita creada pero no sincronizada con Google",
          3000
        );
        setAppointments([...appointments, updatedAppointment]);
      }

      setFormData({
        title: "",
        startTime: "",
        endTime: "",
        clientName: "",
        clientEmail: "",
        location: "",
        description: "",
      });
      setEditingId(null);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      showAlert("error", error.message || "Error al guardar cita", 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    const startZoned = utcToZonedTime(
      new Date(appointment.startTime),
      TIME_ZONE
    );
    const endZoned = utcToZonedTime(new Date(appointment.endTime), TIME_ZONE);
    if (isNaN(startZoned.getTime()) || isNaN(endZoned.getTime())) {
      console.error("Invalid dates in handleEdit:", appointment);
      showAlert("error", "Fechas inválidas en la cita seleccionada", 3000);
      return;
    }
    setFormData({
      title: appointment.title,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      location: appointment.location,
      description: appointment.description,
    });
    setEditingId(appointment.id);
    setEmail(appointment.clientEmail);
    setSelectedEvent({
      id: appointment.id,
      title: `${appointment.title} - ${appointment.clientName}`,
      start: startZoned,
      end: endZoned,
      allDay: false,
      resource: appointment,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta cita?")) return;
    setLoading(true);
    try {
      await deleteAppointment(id);
      setAppointments(appointments.filter((appt) => appt.id !== id));
      showAlert("success", "Cita eliminada", 3000);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error("Error in handleDelete:", error);
      if (error.status === 401) {
        showAlert(
          "warning",
          "Sesión de Google expirada. Reautenticando...",
          3000
        );
        await handleAuth();
        try {
          await deleteAppointment(id);
          setAppointments(appointments.filter((appt) => appt.id !== id));
          showAlert("success", "Cita eliminada tras reautenticación", 3000);
          setSelectedEvent(null);
        } catch (retryError) {
          console.error("Error al reintentar eliminación:", retryError);
          showAlert(
            "error",
            "Error al eliminar cita tras reautenticación",
            3000
          );
        }
      } else {
        showAlert("error", error.message || "Error al eliminar cita", 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (id: number) => {
    setLoading(true);
    try {
      await sendManualReminder(id);
      setAppointments(
        appointments.map((appt) =>
          appt.id === id ? { ...appt, reminderSent: true } : appt
        )
      );
      showAlert("success", "Recordatorio enviado", 3000);
      setSelectedEvent(null);
    } catch (error: any) {
      console.error("Error in handleSendReminder:", error);
      showAlert("error", error.message || "Error al enviar recordatorio", 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleImportEvents = async () => {
    if (!email) {
      showAlert("error", "Ingrese un email válido", 3000);
      return;
    }
    setLoading(true);
    try {
      try {
        await getCalendarEvents(email);
      } catch (authError) {
        console.warn(
          "Usuario no autenticado, iniciando autenticación",
          authError
        );
        await handleAuth();
        try {
          await getCalendarEvents(email);
        } catch (retryError) {
          console.error(
            "Fallo al verificar autenticación tras reintento",
            retryError
          );
          showAlert("error", "No se pudo autenticar con Google", 5000);
          setLoading(false);
          return;
        }
      }
      console.log("Iniciando importación de eventos para", email);
      await importGoogleEvents(email);
      await fetchAppointments(true);
      showAlert("success", "Eventos importados correctamente", 3000);
    } catch (error: any) {
      console.error("Error in handleImportEvents:", {
        message: error.message,
        status: error.status,
        email,
      });
      const errorMessage =
        error.status === 401
          ? "Sesión de Google expirada. Por favor, reautentica."
          : error.status === 403
          ? "No tienes permisos para importar eventos."
          : error.message || "Error al importar eventos de Google";
      showAlert("error", errorMessage, 5000);
      if (error.status === 401) {
        await handleAuth();
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleGoogleEvents = () => {
    if (!email) {
      showAlert(
        "error",
        "Ingrese un email válido para cargar eventos de Google",
        3000
      );
      return;
    }
    console.log("Toggling showGoogleEvents to:", !showGoogleEvents);
    setShowGoogleEvents((prev) => !prev);
    if (!showGoogleEvents) {
      fetchAppointments(true);
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const now = Date.now();
    const DOUBLE_CLICK_THRESHOLD = 500;

    const startZoned = utcToZonedTime(start, TIME_ZONE);
    const endZoned = utcToZonedTime(end, TIME_ZONE);

    setClickCount((prev) => prev + 1);
    setLastClickTime(now);

    setTimeout(() => {
      if (clickCount === 1 && now - lastClickTime < DOUBLE_CLICK_THRESHOLD) {
        setFormData({
          title: "",
          startTime: zonedTimeToUtc(startZoned, TIME_ZONE).toISOString(),
          endTime: zonedTimeToUtc(endZoned, TIME_ZONE).toISOString(),
          clientName: "",
          clientEmail: email,
          location: "",
          description: "",
        });
        setEditingId(null);
        setSelectedEvent(null);
      } else if (
        clickCount >= 2 &&
        now - lastClickTime < DOUBLE_CLICK_THRESHOLD
      ) {
        console.log("Double click detected on slot:", startZoned, endZoned);
        setFormData({
          title: "",
          startTime: zonedTimeToUtc(startZoned, TIME_ZONE).toISOString(),
          endTime: zonedTimeToUtc(endZoned, TIME_ZONE).toISOString(),
          clientName: "",
          clientEmail: email,
          location: "",
          description: "",
        });
        setEditingId(null);
        setSelectedEvent({
          id: "",
          title: "",
          start: startZoned,
          end: endZoned,
          allDay: false,
          resource: {
            title: "",
            clientName: "",
            clientEmail: "",
            startTime: zonedTimeToUtc(startZoned, TIME_ZONE).toISOString(),
            endTime: zonedTimeToUtc(endZoned, TIME_ZONE).toISOString(),
          } as Appointment,
        });
      }
      setClickCount(0);
    }, DOUBLE_CLICK_THRESHOLD);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    console.log("Selected event:", event);
    setSelectedEvent(event);
    if (!event.isGoogleEvent) {
      handleEdit(event.resource as Appointment);
    }
  };

  const handleCreateAppointment = () => {
    const now = utcToZonedTime(new Date(), TIME_ZONE);
    const oneHourLater = new Date(now.getTime() + 3600000);
    setFormData({
      title: "",
      startTime: zonedTimeToUtc(now, TIME_ZONE).toISOString(),
      endTime: zonedTimeToUtc(oneHourLater, TIME_ZONE).toISOString(),
      clientName: "",
      clientEmail: email,
      location: "",
      description: "",
    });
    setEditingId(null);
    setSelectedEvent({
      id: "",
      title: "",
      start: now,
      end: oneHourLater,
      allDay: false,
      resource: {
        title: "",
        clientName: "",
        clientEmail: "",
        startTime: zonedTimeToUtc(now, TIME_ZONE).toISOString(),
        endTime: zonedTimeToUtc(oneHourLater, TIME_ZONE).toISOString(),
      } as Appointment,
    });
  };

  const events: CalendarEvent[] = [
    ...appointments.reduce<CalendarEvent[]>((acc, appt) => {
      const startZoned = utcToZonedTime(new Date(appt.startTime), TIME_ZONE);
      const endZoned = utcToZonedTime(new Date(appt.endTime), TIME_ZONE);
      if (isNaN(startZoned.getTime()) || isNaN(endZoned.getTime())) {
        console.warn(`Invalid dates for appointment ${appt.id}:`, {
          startTime: appt.startTime,
          endTime: appt.endTime,
        });
        return acc;
      }
      acc.push({
        id: appt.id as number,
        title: `${appt.title} - ${appt.clientName}`,
        start: startZoned,
        end: endZoned,
        allDay: false,
        resource: appt,
      });
      return acc;
    }, []),
    ...(showGoogleEvents
      ? googleEvents.reduce<CalendarEvent[]>((acc, event) => {
          const startRaw = event.start.dateTime ?? event.start.date;
          const endRaw = event.end.dateTime ?? event.end.date;

          const start = startRaw
            ? utcToZonedTime(new Date(startRaw), TIME_ZONE)
            : utcToZonedTime(new Date(), TIME_ZONE);

          const end = endRaw
            ? utcToZonedTime(new Date(endRaw), TIME_ZONE)
            : utcToZonedTime(new Date(), TIME_ZONE);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn(`Invalid dates for Google event ${event.id}:`, {
              start: event.start,
              end: event.end,
            });
            return acc;
          }

          return [
            ...acc,
            {
              id: event.id as string,
              title: event.summary,
              start,
              end,
              allDay: !event.start.dateTime,
              isGoogleEvent: true,
              resource: event,
            },
          ];
        }, [])
      : []),
  ];

  console.log(
    "Rendering with eventos:",
    events,
    "showGoogleEvents:",
    showGoogleEvents
  );

  const calendarViews: View[] = ["month", "week", "day", "agenda"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <style>{`
        .rbc-day-slot .rbc-event {
          min-height: 40px !important;
          margin: 2px 0 !important;
          padding: 0 !important;
          border-radius: 8px !important;
          display: flex !important;
          align-items: center !important;
          overflow: hidden !important;
        }
        .rbc-day-slot .rbc-event-label {
          display: none !important;
        }
        .rbc-day-slot .rbc-event-content {
          flex: 1 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        @media (max-width: 640px) {
          .rbc-day-slot .rbc-event {
            min-height: 32px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
      <div className="container mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="text-teal-600 mr-3"
            />
            Gestión de Citas
          </h2>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateAppointment}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Crear Cita</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchAppointments(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !email}
            >
              <FontAwesomeIcon icon={faSync} />
              <span>Refrescar</span>
            </motion.button>
          </div>
        </div>

        <div className="mb-8 bg-gray-50 p-6 rounded-xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email para autenticación y citas
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-lg w-full sm:w-1/2 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
              placeholder="Ingrese el email"
            />
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAuth}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading && (
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
                )}
                <span>Autenticar</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Cerrar Sesión</span>
              </motion.button>
            </div>
          </div>
        </div>

        <div className="mb-8 bg-gray-50 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FontAwesomeIcon icon={faFilter} className="mr-2 text-teal-600" />
              Filtros
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setFilters({ search: "", startDate: "", endDate: "" })
              }
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              Limpiar Filtros
            </motion.button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="Buscar por título o cliente"
              className="border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="mt-4 flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImportEvents}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !email}
            >
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>Importar de Google</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleGoogleEvents}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSync} />
              <span>
                {showGoogleEvents
                  ? "Ocultar Google Events"
                  : "Mostrar Google Events"}
              </span>
            </motion.button>
          </div>
        </div>

        <div className="mb-8">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            className="bg-white rounded-2xl shadow-lg p-4 font-sans"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            views={calendarViews}
            eventPropGetter={(event) => ({
              className: `transition-all duration-200 hover:shadow-md ${
                event.isGoogleEvent
                  ? "bg-gradient-to-r from-red-400 to-red-500"
                  : "bg-gradient-to-r from-teal-400 to-teal-500"
              } text-white border-none opacity-90 hover:opacity-100`,
            })}
            tooltipAccessor={(event) => {
              const resource = event.resource as
                | Appointment
                | GoogleCalendarEvent;
              return event.isGoogleEvent
                ? `Google: ${event.title}\n${
                    (resource as GoogleCalendarEvent).description ||
                    "Sin descripción"
                  }`
                : `Cita: ${event.title}\nCliente: ${
                    (resource as Appointment).clientName
                  }\nUbicación: ${(resource as Appointment).location || "N/A"}`;
            }}
            components={{
              event: CustomEvent,
              toolbar: (props) => (
                <div className="mb-4 flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex space-x-2 mb-2 sm:mb-0">
                    {calendarViews.map((view) => (
                      <motion.button
                        key={view}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => props.onView(view)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          props.view === view
                            ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => props.onNavigate("PREV")}
                      className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-lg"
                    >
                      Anterior
                    </motion.button>
                    <span className="text-lg font-semibold text-gray-800">
                      {props.label}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => props.onNavigate("NEXT")}
                      className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-4 py-2 rounded-lg"
                    >
                      Siguiente
                    </motion.button>
                  </div>
                </div>
              ),
            }}
            dayPropGetter={(date) =>
              formatInTimeZone(date, TIME_ZONE, "yyyy-MM-dd") ===
              formatInTimeZone(new Date(), TIME_ZONE, "yyyy-MM-dd")
                ? { className: "bg-teal-50" }
                : {}
            }
          />
        </div>

        <AnimatePresence>
          {selectedEvent !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedEvent?.isGoogleEvent
                      ? "Evento de Google"
                      : editingId
                      ? "Editar Cita"
                      : "Crear Cita"}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </motion.button>
                </div>
                {selectedEvent?.isGoogleEvent ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Título
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedEvent.title}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Inicio
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatInTimeZone(
                          selectedEvent.start,
                          TIME_ZONE,
                          "dd/MM/yyyy HH:mm z"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fin
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatInTimeZone(
                          selectedEvent.end,
                          TIME_ZONE,
                          "dd/MM/yyyy HH:mm z"
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Descripción
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {(selectedEvent.resource as GoogleCalendarEvent)
                          .description || "Sin descripción"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedEvent(null)}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg"
                      >
                        Cerrar
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Título
                      </label>
                      <input
                        type="text"
                        value={formData.title || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="mt-1 border border-gray-300 rounded-lg w-full p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre del Cliente
                      </label>
                      <input
                        type="text"
                        value={formData.clientName || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientName: e.target.value,
                          })
                        }
                        className="mt-1 border border-gray-300 rounded-lg w-full p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha y Hora de Inicio
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          formData.startTime &&
                          typeof formData.startTime === "string"
                            ? formatInTimeZone(
                                utcToZonedTime(
                                  new Date(formData.startTime),
                                  TIME_ZONE
                                ),
                                TIME_ZONE,
                                "yyyy-MM-dd'T'HH:mm"
                              )
                            : ""
                        }
                        onChange={(e) => {
                          const inputValue = e.target.value; // e.g., "2025-06-17T00:00"
                          if (!inputValue) {
                            showAlert(
                              "error",
                              "Fecha de inicio inválida",
                              3000
                            );
                            return;
                          }
                          // Parsear la fecha como si estuviera en TIME_ZONE
                          const [datePart, timePart] = inputValue.split("T");
                          const [year, month, day] = datePart
                            .split("-")
                            .map(Number);
                          const [hours, minutes] = timePart
                            .split(":")
                            .map(Number);
                          const inputDate = new Date(
                            year,
                            month - 1,
                            day,
                            hours,
                            minutes
                          );
                          if (isNaN(inputDate.getTime())) {
                            showAlert(
                              "error",
                              "Fecha de inicio inválida",
                              3000
                            );
                            return;
                          }
                          // Convertir a UTC asumiendo que inputDate está en TIME_ZONE
                          const utcDate = zonedTimeToUtc(inputDate, TIME_ZONE);
                          console.log("Parsed startTime:", {
                            input: inputValue,
                            inputDate,
                            utcDate: utcDate.toISOString(),
                            zonedBack: formatInTimeZone(
                              utcDate,
                              TIME_ZONE,
                              "dd/MM/yyyy HH:mm z"
                            ),
                          });
                          setFormData({
                            ...formData,
                            startTime: utcDate.toISOString(),
                          });
                        }}
                        className="mt-1 border border-gray-300 rounded-lg w-full p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha y Hora de Fin
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          formData.endTime &&
                          typeof formData.endTime === "string"
                            ? formatInTimeZone(
                                utcToZonedTime(
                                  new Date(formData.endTime),
                                  TIME_ZONE
                                ),
                                TIME_ZONE,
                                "yyyy-MM-dd'T'HH:mm"
                              )
                            : ""
                        }
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (!inputValue) {
                            showAlert("error", "Fecha de fin inválida", 3000);
                            return;
                          }
                          const [datePart, timePart] = inputValue.split("T");
                          const [year, month, day] = datePart
                            .split("-")
                            .map(Number);
                          const [hours, minutes] = timePart
                            .split(":")
                            .map(Number);
                          const inputDate = new Date(
                            year,
                            month - 1,
                            day,
                            hours,
                            minutes
                          );
                          if (isNaN(inputDate.getTime())) {
                            showAlert("error", "Fecha de fin inválida", 3000);
                            return;
                          }
                          const utcDate = zonedTimeToUtc(inputDate, TIME_ZONE);
                          console.log("Parsed endTime:", {
                            input: inputValue,
                            inputDate,
                            utcDate: utcDate.toISOString(),
                            zonedBack: formatInTimeZone(
                              utcDate,
                              TIME_ZONE,
                              "dd/MM/yyyy HH:mm z"
                            ),
                          });
                          setFormData({
                            ...formData,
                            endTime: utcDate.toISOString(),
                          });
                        }}
                        className="mt-1 border border-gray-300 rounded-lg w-full p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={formData.location || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="mt-1 border border-gray-300 rounded-lg w-full p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Descripción
                      </label>
                      <textarea
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 border border-gray-300 rounded-lg w-full p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        rows={4}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {editingId && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => handleSendReminder(editingId)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={
                              loading ||
                              (selectedEvent?.resource as Appointment)
                                ?.reminderSent
                            }
                          >
                            <FontAwesomeIcon icon={faBell} />
                            <span>Enviar Recordatorio</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => handleDelete(editingId)}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            <span>Eliminar</span>
                          </motion.button>
                        </>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        {loading && (
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
                              stroke="gray"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8h8l0 0a8 8 0 01-8 8 8 8 0 01-8-8l0 0"
                            />
                          </svg>
                        )}
                        <span>{editingId ? "Actualizar" : "Crear"}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setSelectedEvent(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                      >
                        Cancelar
                      </motion.button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppointmentsPage;
