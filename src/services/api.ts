import environment from "../environments/environment";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

const getAuthHeaders = (isFormData: boolean = false) => {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("jwt");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

const api = async <T>(
  endpoint: string,
  method: string = "GET",
  body?: unknown
): Promise<T> => {
  const url = `${environment.apiUrl}${endpoint}`;
  const isFormData = body instanceof FormData;

  const response = await fetch(url, {
    method,
    headers: getAuthHeaders(isFormData),
    body: isFormData
      ? (body as FormData)
      : body
      ? JSON.stringify(body)
      : undefined,
  });

  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = await response.text();
    }
    if (response.status === 401) {
      localStorage.removeItem("jwt");
      window.location.href = "/login";
      throw new ApiError(errorMessage, 401);
    }
    if (response.status === 403) {
      throw new ApiError(errorMessage, 403);
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

export default api;
