import api, { ApiError } from "./api";
import type { Appointment } from "../types/appointment";
import type { GoogleCalendarEvent } from "../types/googlecalendarevent";

const API_ROUTES = {
  APPOINTMENTS: "/appointments",
  APPOINTMENT_BY_ID: (id: number) => `/appointments/${id}`,
  GOOGLE_AUTH: "/auth/google",
  GOOGLE_SIGNOUT: "/auth/signout",
  CALENDAR_EVENTS: "/calendar/events",
  REMINDER_CRON: "/admin/config/reminder-cron",
  IMPORT_GOOGLE_EVENTS: "/appointments/import",
} as const;

class AppointmentServiceError extends Error {
  constructor(message: string, status?: number) {
    super(message);
    this.name = "AppointmentServiceError";
    this.status = status;
  }

  status?: number;
}

let appointmentCache: Appointment[] | null = null;
let appointmentCacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const invalidateAppointmentsCache = (): void => {
  appointmentCache = null;
  appointmentCacheTimestamp = null;
  console.log("[invalidateAppointmentsCache] Caché invalidado");
};

export const sendManualReminder = async (id: number): Promise<void> => {
  await api<void>(`/admin/appointments/${id}/reminder`, "POST");
};

export const syncToGoogleCalendar = async (
  id: number,
  email: string
): Promise<Appointment> => {
  return await api<Appointment>(
    `/admin/appointments/${id}/sync-google`,
    "POST",
    undefined,
    { email }
  );
};

export const createAppointment = async (
  appointment: Omit<Appointment, "id" | "reminderSent" | "googleEventId">,
  email: string
): Promise<Appointment> => {
  try {
    const response = await api<Appointment>(
      API_ROUTES.APPOINTMENTS,
      "POST",
      appointment,
      { params: { email } }
    );
    invalidateAppointmentsCache();
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para crear citas"
        : "Error al crear la cita";
    console.error(`[createAppointment] Error: ${errorMessage}`, error);
    throw new AppointmentServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

export const getAppointments = async (
  start: string,
  end: string
): Promise<Appointment[]> => {
  if (
    appointmentCache &&
    appointmentCacheTimestamp &&
    Date.now() - appointmentCacheTimestamp < CACHE_DURATION
  ) {
    console.log(
      `[getAppointments] Usando caché para ${API_ROUTES.APPOINTMENTS}`
    );
    return appointmentCache;
  }

  try {
    const response = await api<Appointment[]>(
      API_ROUTES.APPOINTMENTS,
      "GET",
      undefined,
      { params: { start, end } }
    );
    appointmentCache = response;
    appointmentCacheTimestamp = Date.now();
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para obtener citas"
        : "Error al obtener las citas";
    console.error(`[getAppointments] Error: ${errorMessage}`, error);
    throw new AppointmentServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

export const updateAppointment = async (
  id: number,
  appointment: Omit<Appointment, "id" | "googleEventId">,
  email: string
): Promise<Appointment> => {
  try {
    const response = await api<Appointment>(
      API_ROUTES.APPOINTMENT_BY_ID(id),
      "PUT",
      appointment,
      { params: { email } }
    );
    invalidateAppointmentsCache();
    return response;
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para actualizar citas"
        : error instanceof ApiError && error.status === 404
        ? `Cita con ID ${id} no encontrada`
        : `Error al actualizar la cita con ID ${id}`;
    console.error(`[updateAppointment] Error: ${errorMessage}`, error);
    throw new AppointmentServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

export const deleteAppointment = async (id: number): Promise<void> => {
  try {
    await api<void>(API_ROUTES.APPOINTMENT_BY_ID(id), "DELETE");
    invalidateAppointmentsCache();
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para eliminar citas"
        : error instanceof ApiError && error.status === 404
        ? `Cita con ID ${id} no encontrada`
        : `Error al eliminar la cita con ID ${id}`;
    console.error(`[deleteAppointment] Error: ${errorMessage}`, error);
    throw new AppointmentServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

export const importGoogleEvents = async (email: string): Promise<void> => {
  try {
    await api<void>(API_ROUTES.IMPORT_GOOGLE_EVENTS, "POST", undefined, {
      params: { email },
    });
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para importar eventos"
        : "Error al importar eventos de Google";
    console.error(`[importGoogleEvents] Error: ${errorMessage}`, error);
    throw new AppointmentServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

export const startGoogleAuth = async (email: string): Promise<string> => {
  try {
    return await api<string>(API_ROUTES.GOOGLE_AUTH, "POST", { email });
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 400
        ? "Email inválido o faltante"
        : "Error al iniciar autenticación con Google";
    console.error(`[startGoogleAuth] Error: ${errorMessage}`, error);
    throw new AppointmentServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

export const signOutGoogle = async (email: string): Promise<void> => {
  try {
    await api<void>(API_ROUTES.GOOGLE_SIGNOUT, "POST", undefined, {
      params: { email },
    });
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : "Error al cerrar sesión de Google";
    console.error(`[signOutGoogle] Error: ${errorMessage}`, error);
    throw new AppointmentServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

export const getCalendarEvents = async (
  email: string
): Promise<GoogleCalendarEvent[]> => {
  try {
    return await api<GoogleCalendarEvent[]>(
      API_ROUTES.CALENDAR_EVENTS,
      "GET",
      undefined,
      { params: { email } }
    );
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para acceder a los eventos"
        : "Error al obtener eventos del calendario";
    console.error(`[getCalendarEvents] Error: ${errorMessage}`, error);
    throw new AppointmentServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

export const updateReminderCron = async (cron: string): Promise<void> => {
  try {
    await api<void>(API_ROUTES.REMINDER_CRON, "PUT", { cron });
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para actualizar el cron"
        : error instanceof ApiError && error.status === 400
        ? "Expresión cron inválida"
        : "Error al actualizar el cron de recordatorios";
    console.error(`[updateReminderCron] Error: ${errorMessage}`, error);
    throw new AppointmentServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};
