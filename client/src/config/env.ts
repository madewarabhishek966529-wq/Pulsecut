// Pulsecut Client Environment Configuration

export const clientEnv = {
  APP_ENV: (import.meta.env.VITE_APP_ENV || import.meta.env.MODE || "development") as
    | "development"
    | "test"
    | "production",
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  IS_PRODUCTION: (import.meta.env.VITE_APP_ENV || import.meta.env.MODE) === "production",
};
