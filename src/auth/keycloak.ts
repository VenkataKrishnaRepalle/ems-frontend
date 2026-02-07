import Keycloak, { KeycloakInitOptions, KeycloakInstance } from "keycloak-js";

export type KeycloakEnvConfig = {
  url: string;
  realm: string;
  clientId: string;
};

export function readKeycloakEnv(): KeycloakEnvConfig | null {
  const url = (process.env.REACT_APP_KEYCLOAK_URL || "").trim();
  const realm = (process.env.REACT_APP_KEYCLOAK_REALM || "").trim();
  const clientId = (process.env.REACT_APP_KEYCLOAK_CLIENT_ID || "").trim();

  if (!url || !realm || !clientId) return null;
  return { url, realm, clientId };
}

const env = readKeycloakEnv();

export const keycloak: KeycloakInstance | null = env
  ? new Keycloak({
      url: env.url,
      realm: env.realm,
      clientId: env.clientId,
    })
  : null;

export const defaultKeycloakInitOptions: KeycloakInitOptions = {
  onLoad: "check-sso",
  pkceMethod: "S256",
  checkLoginIframe: false,
  ...(String(process.env.REACT_APP_KEYCLOAK_SILENT_SSO ?? "false").toLowerCase() === "true"
    ? { silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html` }
    : {}),
};

let initPromise: Promise<boolean> | null = null;

async function initKeycloak(options: KeycloakInitOptions = defaultKeycloakInitOptions): Promise<boolean> {
  if (!keycloak) return false;
  return keycloak.init(options);
}

// React 18 StrictMode runs effects twice in dev; also some apps remount providers.
// Cache init so we don't kick off multiple simultaneous init() calls.
export function initKeycloakOnce(options: KeycloakInitOptions = defaultKeycloakInitOptions): Promise<boolean> {
  if (!keycloak) return Promise.resolve(false);
  initPromise ??= initKeycloak(options);
  return initPromise;
}

export async function ensureFreshToken(minValiditySeconds = 30): Promise<string | null> {
  if (!keycloak) return null;
  if (!keycloak.authenticated) return null;

  try {
    await keycloak.updateToken(minValiditySeconds);
    return keycloak.token ?? null;
  } catch {
    return null;
  }
}
