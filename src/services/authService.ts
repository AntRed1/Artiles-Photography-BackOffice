import environment from "../environments/environment";

/**
 * Respuesta esperada del backend al autenticarse.
 */
export interface AuthResponse {
  token: string;
  user: {
    name: string;
    role: string;
  };
}

/**
 * Inicia sesión con las credenciales proporcionadas.
 *
 * @param credentials Objeto con email y contraseña.
 * @returns Un objeto con el token JWT y la información del usuario.
 * @throws Error si la respuesta del servidor no es exitosa.
 */
export const login = async (credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await fetch(`${environment.apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Error al iniciar sesión");
  }

  return response.json();
};

/**
 * Registra un nuevo usuario en el sistema.
 *
 * @param credentials Objeto con nombre, email y contraseña.
 * @returns Un objeto con el token JWT y la información del usuario registrado.
 * @throws Error si la respuesta del servidor no es exitosa.
 */
export const register = async (credentials: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await fetch(`${environment.apiUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Error al registrar usuario");
  }

  return response.json();
};
