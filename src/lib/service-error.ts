export type ServiceErrorBody = {
  error?: string;
  code?: string;
  action?: string;
  message?: string;
  detail?: string;
};

export class ServiceApiError extends Error {
  status: number;
  code?: string;
  action?: string;
  body: unknown;

  constructor(status: number, message: string, body: unknown, code?: string, action?: string) {
    super(message);
    this.name = "ServiceApiError";
    this.status = status;
    this.code = code;
    this.action = action;
    this.body = body;
  }
}

export function mapStatusMessage(status: number): string {
  if (status === 401) return "Authentication required. Please sign in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested resource was not found.";
  if (status >= 500) return "Service is temporarily unavailable. Please try again.";
  return "Request failed.";
}

export function parseServiceErrorBody(payload: unknown): ServiceErrorBody | null {
  if (!payload || typeof payload !== "object") return null;
  return payload as ServiceErrorBody;
}
