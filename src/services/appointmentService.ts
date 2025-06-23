/* eslint-disable @typescript-eslint/no-explicit-any */
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
  SYNC_GOOGLE: (id: number) => `/admin/appointments/${id}/sync-google`,
  SEND_REMINDER: (id: number) => `/admin/appointments/${id}/reminder`,
} as const;

class AppointmentServiceError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "AppointmentServiceError";
    this.status = status;
  }
}

let appointmentCache: Appointment[] | null = null;
let appointmentCacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export const invalidateAppointmentsCache = (): void => {
  appointmentCache = null;
  appointmentCacheTimestamp = null;
  console.log("[invalidateAppointmentsCache] Caché invalidado");
};

export const sendManualReminder = async (id: number): Promise<void> => {
  try {
    await api<void>(API_ROUTES.SEND_REMINDER(id), "POST");
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para enviar recordatorios"
        : error instanceof ApiError && error.status === 404
        ? `Cita con ID ${id} no encontrada`
        : `Error al enviar recordatorio para la cita con ID ${id}`;
    console.error(`[sendManualReminder] Error: ${errorMessage}`, error);
    throw new AppointmentServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

export const syncToGoogleCalendar = async (
  id: number,
  email: string
): Promise<Appointment> => {
  try {
    console.log(
      `[syncToGoogleCalendar] Iniciando sincronización para cita ID ${id} con email ${email}`
    );
    const response = await api<Appointment>(
      API_ROUTES.SYNC_GOOGLE(id),
      "POST",
      undefined,
      { email }
    );
    console.log(
      `[syncToGoogleCalendar] Sincronización exitosa para cita ID ${id}`
    );
    return response;
  } catch (error) {
    let errorMessage = "Error al sincronizar cita con Google Calendar";
    let status: number | undefined;

    if (error instanceof ApiError) {
      status = error.status;
      switch (error.status) {
        case 400:
          errorMessage =
            error.message || "La cita ya está sincronizada o datos inválidos";
          break;
        case 401:
          errorMessage = "Sesión expirada o no autorizada con Google";
          break;
        case 403:
          errorMessage =
            "No tienes permisos para sincronizar con Google Calendar";
          break;
        case 404:
          errorMessage = `Cita con ID ${id} no encontrada`;
          break;
        default:
          errorMessage = `Error al sincronizar cita con ID ${id}: ${error.message}`;
      }
    }
    console.error(`[syncToGoogleCalendar] Error: ${errorMessage}`, {
      error,
      status,
      email,
      id,
    });
    throw new AppointmentServiceError(errorMessage, status);
  }
};

export const createAppointment = async (
  appointment: Omit<Appointment, "id" | "reminderSent" | "googleEventId">,
  email: string
): Promise<Appointment> => {
  try {
    console.log(`[createAppointment] Creando cita con datos:`, appointment);
    const response = await api<Appointment>(
      API_ROUTES.APPOINTMENTS,
      "POST",
      appointment,
      { email }
    );
    invalidateAppointmentsCache();
    console.log(`[createAppointment] Cita creada con ID ${response.id}`);
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
    console.log(
      `[getAppointments] Obteniendo citas desde ${start} hasta ${end}`
    );
    const response = await api<Appointment[]>(
      API_ROUTES.APPOINTMENTS,
      "GET",
      undefined,
      { start, end }
    );
    appointmentCache = response;
    appointmentCacheTimestamp = Date.now();
    console.log(`[getAppointments] ${response.length} citas obtenidas`);
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
    console.log(
      `[updateAppointment] Actualizando cita ID ${id} con datos:`,
      appointment
    );
    const response = await api<Appointment>(
      API_ROUTES.APPOINTMENT_BY_ID(id),
      "PUT",
      appointment,
      { email }
    );
    invalidateAppointmentsCache();
    console.log(`[updateAppointment] Cita actualizada con ID ${id}`);
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
    console.log(`[deleteAppointment] Cita eliminada con ID ${id}`);
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
      email,
    });
    console.log(`[importGoogleEvents] Eventos importados para ${email}`);
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
    const response = await api<{ url: string }>(
      API_ROUTES.GOOGLE_AUTH,
      "POST",
      { email }
    );
    console.log(`[startGoogleAuth] OAuth URL: ${response.url}`);
    return response.url;
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 400
        ? "Email inválido o faltante"
        : `Error al iniciar autenticación con Google`;
    console.error(`[startGoogleAuth] Error: ${errorMessage}`, error);
    throw new AppointmentServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

export const signOutGoogle = async (email: string): Promise<void> => {
  try {
    await api<void>(API_ROUTES.GOOGLE_SIGNOUT, "POST", { email });
    console.log(`[signOutGoogle] Sesión cerrada para ${email}`);
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 400
        ? "Email inválido o faltante"
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
    console.log(`[getCalendarEvents] Obteniendo eventos para ${email}`);
    const response = await api<any[]>(
      API_ROUTES.CALENDAR_EVENTS,
      "GET",
      undefined,
      { email }
    );
    const events = response.map((event) => ({
      id: event.id,
      summary: event.summary || "Sin título",
      description: event.description || "",
      location: event.location || "",
      start: {
        dateTime: event.start?.dateTime || "",
        date: event.start?.date || "",
      },
      end: {
        dateTime: event.end?.dateTime || "",
        date: event.end?.date || "",
      },
    }));
    console.log(`[getCalendarEvents] ${events.length} eventos obtenidos`);
    return events;
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para acceder a los eventos"
        : error instanceof ApiError && error.status === 400
        ? "Email inválido o faltante"
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
    console.log(`[updateReminderCron] Cron actualizado a ${cron}`);
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
