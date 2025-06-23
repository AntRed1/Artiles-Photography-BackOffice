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
    const timer = setTimeout(() => {
      reject(new ApiError("Tiempo de espera excedido", 408));
    }, timeout);

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
  body?: FormData | object,
  params?: Record<string, string | number | boolean>
): Promise<T> => {
  const url = new URL(`${environment.apiUrl}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
  }

  const token = localStorage.getItem("jwt");
  const headers: HeadersInit = {};

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn(`[${method}] ${url} - Token no encontrado en localStorage`);
  }

  try {
    const response = await fetchWithTimeout(url.toString(), {
      method,
      headers,
      body:
        body instanceof FormData
          ? body
          : body
          ? JSON.stringify(body)
          : undefined,
    });

    const contentType = response.headers.get("content-type");
    let responseData: unknown;
    let responseText: string;

    if (contentType?.includes("application/json")) {
      responseData = await response.json();
      responseText = JSON.stringify(responseData);
    } else {
      responseText = await response.text();
      responseData = responseText;
    }

    if (!response.ok) {
      let errorMessage = responseText;
      if (
        typeof responseData === "object" &&
        responseData &&
        "error" in responseData
      ) {
        errorMessage = (responseData as { error: string }).error;
      }

      switch (response.status) {
        case 401:
          localStorage.removeItem("jwt");
          throw new ApiError(
            errorMessage || "Sesión expirada. Inicia sesión nuevamente.",
            401
          );
        case 403:
          throw new ApiError(
            errorMessage || "Acceso denegado. No tienes permisos suficientes.",
            403
          );
        case 503:
          throw new ApiError(errorMessage || "Servicio no disponible.", 503);
        default:
          throw new ApiError(
            errorMessage || "Error en la solicitud al servidor.",
            response.status
          );
      }
    }

    if (response.status === 204) {
      return undefined as T;
    }

    if (contentType?.includes("application/json")) {
      return responseData as T;
    }

    throw new ApiError("Respuesta del servidor no válida", 500);
  } catch (error) {
    console.error(`[${method}] ${url} - Error en fetch:`, error);

    if (error instanceof ApiError) {
      throw error;
    }

    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      throw new ApiError(
        `No se pudo conectar con el servidor. Verifica la URL o configuración CORS. [${url}]`,
        0
      );
    }

    throw new ApiError("Error inesperado en la red o servidor", 500);
  }
};

export default api;
