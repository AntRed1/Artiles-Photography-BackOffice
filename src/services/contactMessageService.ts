import api, { ApiError } from "./api";
import type { ContactMessage } from "../types/contactmessage";

// Definición de rutas para facilitar el mantenimiento
const API_ROUTES = {
  CONTACT_MESSAGES: "/contact/admin/messages",
  CONTACT_MESSAGE_BY_ID: (id: number) => `/contact/admin/messages/${id}`,
  SEND_EMAIL: "/contact/admin/messages/send-email",
} as const;

// Interfaz para el cuerpo de la solicitud de actualización
interface UpdateContactMessageData {
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
}

// Interfaz para la solicitud de envío de correo
interface SendEmailData {
  messageId?: number; // Para reenviar el correo de confirmación
  from?: string; // Para correo personalizado
  to?: string; // Para correo personalizado
  subject?: string; // Para correo personalizado
  date?: string; // Para correo personalizado
  body?: string; // Para correo personalizado
}

// Clase para errores personalizados del servicio
class ContactMessageServiceError extends Error {
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ContactMessageServiceError";
    this.status = status;
  }

  status?: number;
}

// Caché en memoria para getContactMessages
let messageCache: ContactMessage[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

/**
 * Invalida manualmente el caché de mensajes.
 */
export const invalidateMessagesCache = (): void => {
  messageCache = null;
  cacheTimestamp = null;
  console.log("[invalidateMessagesCache] Caché invalidado");
};

/**
 * Obtiene todos los mensajes de contacto, usando caché si está disponible.
 * @returns Una promesa que resuelve en un arreglo de mensajes de contacto.
 * @throws ContactMessageServiceError si ocurre un error en la solicitud.
 */
export const getContactMessages = async (): Promise<ContactMessage[]> => {
  // Verificar si la caché es válida
  if (
    messageCache &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp < CACHE_DURATION
  ) {
    console.log(
      `[getContactMessages] Usando caché para ${API_ROUTES.CONTACT_MESSAGES}`
    );
    return messageCache;
  }

  try {
    console.log(
      `[getContactMessages] Solicitando ${API_ROUTES.CONTACT_MESSAGES}`
    );
    const messages = await api<ContactMessage[]>(
      API_ROUTES.CONTACT_MESSAGES,
      "GET"
    );
    // Actualizar caché
    messageCache = messages;
    cacheTimestamp = Date.now();
    return messages;
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para acceder a los mensajes"
        : "Error al obtener los mensajes de contacto";
    console.error(`[getContactMessages] Error: ${errorMessage}`, error);
    throw new ContactMessageServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

/**
 * Obtiene un mensaje de contacto por su ID.
 * @param id - El ID del mensaje.
 * @returns Una promesa que resuelve en el mensaje de contacto.
 * @throws ContactMessageServiceError si el ID es inválido o ocurre un error.
 */
export const getContactMessageById = async (
  id: number
): Promise<ContactMessage> => {
  if (!Number.isInteger(id) || id <= 0) {
    console.error(`[getContactMessageById] ID inválido: ${id}`);
    throw new ContactMessageServiceError(
      "El ID debe ser un número entero positivo"
    );
  }

  try {
    console.log(
      `[getContactMessageById] Solicitando ${API_ROUTES.CONTACT_MESSAGE_BY_ID(
        id
      )}`
    );
    return await api<ContactMessage>(
      API_ROUTES.CONTACT_MESSAGE_BY_ID(id),
      "GET"
    );
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para acceder al mensaje"
        : error instanceof ApiError && error.status === 404
        ? `Mensaje con ID ${id} no encontrado`
        : `Error al obtener el mensaje con ID ${id}`;
    console.error(`[getContactMessageById] Error: ${errorMessage}`, error);
    throw new ContactMessageServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

/**
 * Actualiza un mensaje de contacto por su ID.
 * @param id - El ID del mensaje.
 * @param data - Los datos del mensaje a actualizar.
 * @returns Una promesa que resuelve en el mensaje actualizado.
 * @throws ContactMessageServiceError si el ID es inválido, los datos son inválidos o ocurre un error.
 */
export const updateContactMessage = async (
  id: number,
  data: UpdateContactMessageData
): Promise<ContactMessage> => {
  if (!Number.isInteger(id) || id <= 0) {
    console.error(`[updateContactMessage] ID inválido: ${id}`);
    throw new ContactMessageServiceError(
      "El ID debe ser un número entero positivo"
    );
  }

  // Validar campos obligatorios
  if (!data.name || !data.email || !data.message) {
    console.error(
      `[updateContactMessage] Datos inválidos: ${JSON.stringify(data)}`
    );
    throw new ContactMessageServiceError(
      "El nombre, correo electrónico y mensaje son obligatorios"
    );
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    console.error(`[updateContactMessage] Correo inválido: ${data.email}`);
    throw new ContactMessageServiceError("El correo electrónico no es válido");
  }

  try {
    console.log(
      `[updateContactMessage] Actualizando ${API_ROUTES.CONTACT_MESSAGE_BY_ID(
        id
      )}`
    );
    const updatedMessage = await api<ContactMessage>(
      API_ROUTES.CONTACT_MESSAGE_BY_ID(id),
      "PUT",
      data
    );
    // Invalidar caché al actualizar un mensaje
    invalidateMessagesCache();
    return updatedMessage;
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para actualizar el mensaje"
        : error instanceof ApiError && error.status === 404
        ? `Mensaje con ID ${id} no encontrado`
        : `Error al actualizar el mensaje con ID ${id}`;
    console.error(`[updateContactMessage] Error: ${errorMessage}`, error);
    throw new ContactMessageServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

/**
 * Elimina un mensaje de contacto por su ID.
 * @param id - El ID del mensaje.
 * @throws ContactMessageServiceError si el ID es inválido o ocurre un error.
 */
export const deleteContactMessage = async (id: number): Promise<void> => {
  if (!Number.isInteger(id) || id <= 0) {
    console.error(`[deleteContactMessage] ID inválido: ${id}`);
    throw new ContactMessageServiceError(
      "El ID debe ser un número entero positivo"
    );
  }

  try {
    console.log(
      `[deleteContactMessage] Eliminando ${API_ROUTES.CONTACT_MESSAGE_BY_ID(
        id
      )}`
    );
    await api<void>(API_ROUTES.CONTACT_MESSAGE_BY_ID(id), "DELETE");
    // Invalidar caché al eliminar un mensaje
    invalidateMessagesCache();
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para eliminar el mensaje"
        : error instanceof ApiError && error.status === 404
        ? `Mensaje con ID ${id} no encontrado`
        : `Error al eliminar el mensaje con ID ${id}`;
    console.error(`[deleteContactMessage] Error: ${errorMessage}`, error);
    throw new ContactMessageServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};

/**
 * Envía un correo, ya sea reenviando el correo de confirmación para un mensaje específico o enviando un correo personalizado.
 * @param data - Los datos del correo a enviar.
 * @throws ContactMessageServiceError si los datos son inválidos o ocurre un error.
 */
export const sendEmail = async (data: SendEmailData): Promise<void> => {
  // Validar datos
  if (data.messageId) {
    if (!Number.isInteger(data.messageId) || data.messageId <= 0) {
      console.error(`[sendEmail] ID de mensaje inválido: ${data.messageId}`);
      throw new ContactMessageServiceError(
        "El ID del mensaje debe ser un número entero positivo"
      );
    }
  } else if (data.from && data.to && data.subject && data.date && data.body) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.from)) {
      console.error(`[sendEmail] Correo 'from' inválido: ${data.from}`);
      throw new ContactMessageServiceError("El correo 'from' no es válido");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.to)) {
      console.error(`[sendEmail] Correo 'to' inválido: ${data.to}`);
      throw new ContactMessageServiceError("El correo 'to' no es válido");
    }
    if (!data.subject.trim()) {
      console.error("[sendEmail] Asunto vacío");
      throw new ContactMessageServiceError("El asunto es obligatorio");
    }
    if (!data.date.trim()) {
      console.error("[sendEmail] Fecha vacía");
      throw new ContactMessageServiceError("La fecha es obligatoria");
    }
    if (!data.body.trim()) {
      console.error("[sendEmail] Cuerpo vacío");
      throw new ContactMessageServiceError(
        "El cuerpo del mensaje es obligatorio"
      );
    }
  } else {
    console.error(`[sendEmail] Datos incompletos: ${JSON.stringify(data)}`);
    throw new ContactMessageServiceError(
      "Debe proporcionar el ID del mensaje para reenviar o todos los campos para un correo personalizado"
    );
  }

  try {
    console.log(`[sendEmail] Enviando correo a ${API_ROUTES.SEND_EMAIL}`);
    await api<void>(API_ROUTES.SEND_EMAIL, "POST", data);
  } catch (error) {
    const errorMessage =
      error instanceof ApiError && error.status === 401
        ? "Sesión expirada o no autorizada"
        : error instanceof ApiError && error.status === 403
        ? "No tienes permisos para enviar correos"
        : error instanceof ApiError && error.status === 404
        ? "Mensaje no encontrado"
        : "Error al enviar el correo";
    console.error(`[sendEmail] Error: ${errorMessage}`, error);
    throw new ContactMessageServiceError(
      errorMessage,
      error instanceof ApiError ? error.status : undefined
    );
  }
};
