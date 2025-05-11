import environment from "../environments/environment";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

const fetchWithTimeout = (
  url: string,
  options: RequestInit,
  timeout = 10000
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new ApiError("Tiempo de espera excedido", 408)),
      timeout
    );
    fetch(url, options)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

const api = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
  body?: FormData | object
): Promise<T> => {
  const url = `${environment.apiUrl}${endpoint}`;
  const token = localStorage.getItem("jwt");

  const headers: HeadersInit = {};
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetchWithTimeout(url, {
      method,
      headers,
      body:
        body instanceof FormData
          ? body
          : body
          ? JSON.stringify(body)
          : undefined,
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      const errorText = contentType?.includes("application/json")
        ? JSON.stringify(await response.json())
        : await response.text();

      console.error(`API error: ${response.status} ${response.statusText}`, {
        endpoint,
        errorText,
        headers,
        body: body instanceof FormData ? [...body.entries()] : body,
      });

      if (response.status === 401) {
        throw new ApiError(
          errorText || "Sesión expirada. Por favor, inicia sesión nuevamente.",
          401
        );
      }

      if (response.status === 403) {
        throw new ApiError(
          errorText || "Acceso denegado. No tienes permisos suficientes.",
          403
        );
      }

      throw new ApiError(errorText || "Error en la solicitud", response.status);
    }

    // Manejar respuestas 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json() as Promise<T>;
    }

    throw new ApiError("Respuesta no válida del servidor", 500);
  } catch (error) {
    console.error("API fetch error:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error de red o servidor no disponible", 500);
  }
};

export default api;
