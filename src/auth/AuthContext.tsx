import * as React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch } from "../redux/hooks";
import { clearEmployee } from "../redux/employeeSlice";
import { LOGOUT_API } from "../api/Auth";
import { initKeycloakOnce, keycloak } from "./keycloak";

export type AuthContextValue = {
  configured: boolean;
  initialized: boolean;
  authenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getKeycloakInitErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || null;
  if (typeof error === "object") {
    const maybe = error as { error?: unknown; error_description?: unknown; message?: unknown };
    if (typeof maybe.error_description === "string" && maybe.error_description.trim()) return maybe.error_description;
    if (typeof maybe.error === "string" && maybe.error.trim()) return maybe.error;
    if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message;
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const configured = Boolean(keycloak);
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!configured || !keycloak) {
        setInitialized(true);
        setAuthenticated(false);
        return;
      }

      try {
        keycloak.onAuthLogout = () => {
          dispatch(clearEmployee());
          setAuthenticated(false);
        };

        keycloak.onAuthSuccess = () => {
          setAuthenticated(true);
        };

        keycloak.onTokenExpired = async () => {
          try {
            await keycloak.updateToken(30);
          } catch {
            dispatch(clearEmployee());
            setAuthenticated(false);
          }
        };

        const isAuthenticated = await initKeycloakOnce();
        if (cancelled) return;

        setInitialized(true);
        setAuthenticated(Boolean(isAuthenticated));
        if (!isAuthenticated) dispatch(clearEmployee());
      } catch (e) {
        if (cancelled) return;
        setInitialized(true);
        setAuthenticated(false);
        dispatch(clearEmployee());
        // eslint-disable-next-line no-console
        console.error("Keycloak init failed:", e);
        const message = getKeycloakInitErrorMessage(e);
        toast.error(message ? `Failed to initialize Keycloak login: ${message}` : "Failed to initialize Keycloak login.");
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [configured, dispatch]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      initialized,
      authenticated,
      login: () => {
        if (!configured || !keycloak) return;
        void keycloak.login();
      },
      logout: async () => {
        dispatch(clearEmployee());
        if (configured && keycloak?.authenticated) {
          await keycloak.logout({ redirectUri: window.location.origin });
          return;
        }
        try {
          await LOGOUT_API();
        } catch {
          // ignore
        }
      },
    }),
    [authenticated, configured, dispatch, initialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
