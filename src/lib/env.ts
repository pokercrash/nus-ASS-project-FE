const isProduction = import.meta.env.PROD;

export const env = {
  authBaseUrl: isProduction
    ? "/auth-api"
    : (import.meta.env.VITE_AUTH_API_BASE_URL as string | undefined) ?? "http://localhost:8080",
  resourceBaseUrl: isProduction
    ? "/resource-api"
    : (import.meta.env.VITE_RESOURCE_API_BASE_URL as string | undefined) ?? "http://localhost:8081",
};
