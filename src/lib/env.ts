const DEFAULT_AUTH_BASE_URL = import.meta.env.PROD ? "/auth-api" : "http://localhost:8080";
const DEFAULT_RESOURCE_BASE_URL = import.meta.env.PROD ? "/resource-api" : "http://localhost:8081";

export const env = {
  authBaseUrl: (import.meta.env.VITE_AUTH_API_BASE_URL as string | undefined) ?? DEFAULT_AUTH_BASE_URL,
  resourceBaseUrl:
    (import.meta.env.VITE_RESOURCE_API_BASE_URL as string | undefined) ?? DEFAULT_RESOURCE_BASE_URL,
};
