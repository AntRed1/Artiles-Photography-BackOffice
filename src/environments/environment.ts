// src/environments/environment.ts
interface Environment {
  production: boolean;
  apiUrl: string;
  apiTimeout: number;
}

// Validación estricta - todas las variables son requeridas
const requiredEnvVars = [
  "VITE_API_URL",
  "VITE_ENVIRONMENT",
  "VITE_API_TIMEOUT",
];
const missingVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName]
);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}. ` +
      `Please check your .env file and ensure all variables are defined.`
  );
}

const environment: Environment = {
  production: import.meta.env.VITE_ENVIRONMENT === "production",
  apiUrl: import.meta.env.VITE_API_URL,
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT, 10),
};

// Validación adicional para valores numéricos
if (isNaN(environment.apiTimeout)) {
  throw new Error("VITE_API_TIMEOUT must be a valid number");
}

// Validación adicional para URL
if (!environment.apiUrl.startsWith("http")) {
  throw new Error(
    "VITE_API_URL must be a valid URL starting with http or https"
  );
}

export default environment;
