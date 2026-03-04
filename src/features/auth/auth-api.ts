import { env } from "@/lib/env";

const API_PREFIX = "/api/v1";
const AUTH_PREFIX = `${API_PREFIX}/auth`;

export type RegisterRequest = {
  username: string;
  password: string;
  email?: string;
  role?: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type AuthTokenResponse = {
  message: string;
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type ApiErrorBody = {
  error?: string;
};

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${env.authBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const hasJson = contentType.includes("application/json");
  const payload = hasJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload
        ? String((payload as ApiErrorBody).error ?? "Request failed")
        : response.statusText || "Request failed";

    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}

export function registerUser(payload: RegisterRequest) {
  return request<{ message: string }>(`${AUTH_PREFIX}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginRequest) {
  return request<AuthTokenResponse>(`${AUTH_PREFIX}/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refreshToken() {
  return request<AuthTokenResponse>(`${AUTH_PREFIX}/refresh`, {
    method: "POST",
  });
}

export function logoutUser() {
  return request<{ message: string }>(`${AUTH_PREFIX}/logout`, {
    method: "POST",
  });
}

export function getHealth() {
  return request<{ status: string }>(`${API_PREFIX}/health`, {
    method: "GET",
  });
}
