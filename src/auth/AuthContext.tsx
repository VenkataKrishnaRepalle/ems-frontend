import * as React from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch } from "../redux/hooks";
import { clearEmployee } from "../redux/employeeSlice";
import { LOGOUT_API } from "../api/Auth";
import { initKeycloak, keycloak, readKeycloakEnv } from "./keycloak";

export type AuthContextValue = {
  configured: boolean;
  initialized: boolean;
  authenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const configured = !!readKeycloakEnv();
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const loginInProgressRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!configured || !keycloak) {
        if (mounted) {
          setInitialized(true);
          setAuthenticated(false);
        }
        return;
      }

      try {
        const initTimeoutMs = Number(process.env.REACT_APP_KEYCLOAK_INIT_TIMEOUT_MS ?? "8000");
        const isAuthenticated = await Promise.race([
          initKeycloak(),
          new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error("Keycloak init timeout")), initTimeoutMs)
          ),
        ]);
        if (!mounted) return;

        setInitialized(true);
        setAuthenticated(Boolean(isAuthenticated));
        if (!isAuthenticated) dispatch(clearEmployee());

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
      } catch (e) {
        if (!mounted) return;
        setInitialized(true);
        setAuthenticated(false);
        dispatch(clearEmployee());
        toast.error("Failed to initialize Keycloak login.");
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [configured, dispatch]);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      initialized,
      authenticated,
      login: () => {
        if (!configured || !keycloak) return;
        if (loginInProgressRef.current) return;
        loginInProgressRef.current = true;
        keycloak.login().finally(() => {
          loginInProgressRef.current = false;
        });
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
