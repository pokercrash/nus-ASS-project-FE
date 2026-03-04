const DEFAULT_AUTH_BASE_URL = "http://localhost:8080";

export const env = {
  authBaseUrl: (import.meta.env.VITE_AUTH_API_BASE_URL as string | undefined) ?? DEFAULT_AUTH_BASE_URL,
};
