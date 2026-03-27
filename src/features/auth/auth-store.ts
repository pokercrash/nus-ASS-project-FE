import { createContext } from "react";

import type { LoginRequest, RegisterRequest } from "./auth-api";

export type AuthUser = {
  username: string;
  role: string;
};

export type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginRequest) => Promise<AuthUser | null>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string>;
  authorizedFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  authorizedRequest: <T>(input: RequestInfo | URL, init?: RequestInit) => Promise<T>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
