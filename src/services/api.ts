import environment from "../environments/environment";

/**
 * Genera los encabezados de autenticación para las peticiones.
 */
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("jwt")}`,
});

/**
 * Función general para realizar peticiones a la API.
 *
 * @template T Tipo esperado en la respuesta.
 * @param endpoint Ruta relativa al backend (sin `/api` si ya está en `apiUrl`).
 * @param method Método HTTP (por defecto "GET").
 * @param body Cuerpo de la solicitud, si aplica.
 * @returns Respuesta parseada como tipo T.
 * @throws Error si la respuesta no es exitosa.
 */
const api = async <T>(
  endpoint: string,
  method: string = "GET",
  body?: unknown
): Promise<T> => {
  const url = `${environment.apiUrl}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} ${error}`);
  }

  return response.json();
};

export default api;
