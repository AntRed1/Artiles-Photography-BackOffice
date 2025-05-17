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
  console.log(`[${method}] ${url} - Token enviado:`, token || "No token");

  const headers: HeadersInit = {};
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn(`[${method}] ${url} - No se encontró token en localStorage`);
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

    const contentType = response.headers.get("content-type");
    let responseData: unknown;
    let responseText: string;

    if (contentType?.includes("application/json")) {
      responseData = await response.json();
      responseText = JSON.stringify(responseData);
    } else {
      responseText = await response.text();
    }

    console.log(
      `[${method}] ${url} - Status: ${response.status}, Response:`,
      responseData || responseText
    );

    if (!response.ok) {
      console.error(
        `[${method}] ${url} - Error ${response.status}: ${response.statusText}`,
        {
          endpoint,
          responseText,
          headers,
          body: body instanceof FormData ? [...body.entries()] : body,
        }
      );

      if (response.status === 401) {
        console.warn(`[${method}] ${url} - Error 401, detalles:`, responseData);
        // Temporarily disable redirect for debugging
        // localStorage.removeItem("jwt");
        // window.location.href = "/login";
        throw new ApiError(
          responseText ||
            "Sesión expirada. Por favor, inicia sesión nuevamente.",
          401
        );
      }

      if (response.status === 403) {
        throw new ApiError(
          responseText || "Acceso denegado. No tienes permisos suficientes.",
          403
        );
      }

      throw new ApiError(
        responseText || "Error en la solicitud",
        response.status
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    if (contentType?.includes("application/json")) {
      return responseData as T;
    }

    throw new ApiError("Respuesta no válida del servidor", 500);
  } catch (error) {
    console.error(`[${method}] ${url} - Fetch error:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Error de red o servidor no disponible", 500);
  }
};

export default api;
