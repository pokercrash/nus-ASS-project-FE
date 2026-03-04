import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { decodeAccessToken, type AccessTokenClaims } from "@/lib/jwt";
import {
  ApiError,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  type LoginRequest,
  type RegisterRequest,
} from "./auth-api";

type AuthUser = {
  username: string;
  role: string;
};

type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string>;
  authorizedFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const SESSION_HINT_KEY = "bookly_has_auth_session";

function setSessionHint(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem(SESSION_HINT_KEY, "1");
    } else {
      window.localStorage.removeItem(SESSION_HINT_KEY);
    }
  } catch {
    // ignore storage failures
  }
}

function getSessionHint() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function claimsToUser(claims: AccessTokenClaims | null): AuthUser | null {
  if (!claims?.username) return null;

  return {
    username: claims.username,
    role: claims.role ?? "user",
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const accessTokenRef = useRef<string | null>(null);
  const hasBootstrappedRef = useRef(false);

  const applyAccessToken = useCallback((token: string) => {
    accessTokenRef.current = token;
    setAccessToken(token);
    setUser(claimsToUser(decodeAccessToken(token)));
    setSessionHint(true);
  }, []);

  const clearSession = useCallback((clearHint = false) => {
    accessTokenRef.current = null;
    setAccessToken(null);
    setUser(null);
    if (clearHint) {
      setSessionHint(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const data = await refreshToken();
    applyAccessToken(data.access_token);
    return data.access_token;
  }, [applyAccessToken]);

  const login = useCallback(
    async (payload: LoginRequest) => {
      const data = await loginUser(payload);
      applyAccessToken(data.access_token);
    },
    [applyAccessToken]
  );

  const register = useCallback(async (payload: RegisterRequest) => {
    await registerUser(payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      clearSession(true);
    }
  }, [clearSession]);

  const authorizedFetch = useCallback(
    async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const execute = async (token: string | null) => {
        const headers = new Headers(init.headers ?? {});
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        return fetch(input, {
          ...init,
          headers,
          credentials: "include",
        });
      };

      let response = await execute(accessTokenRef.current);

      if (response.status === 401 && getSessionHint()) {
        try {
          const newToken = await refreshSession();
          response = await execute(newToken);
        } catch {
          clearSession(true);
        }
      }

      return response;
    },
    [clearSession, refreshSession]
  );

  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return;
    }
    hasBootstrappedRef.current = true;

    let isMounted = true;

    const bootstrap = async () => {
      if (!getSessionHint()) {
        if (isMounted) {
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        await refreshSession();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession(true);
        } else if (error instanceof ApiError) {
          console.warn("Session bootstrap failed", error.message);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [clearSession, refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken),
      isBootstrapping,
      login,
      register,
      logout,
      refreshSession,
      authorizedFetch,
    }),
    [accessToken, user, isBootstrapping, login, register, logout, refreshSession, authorizedFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
