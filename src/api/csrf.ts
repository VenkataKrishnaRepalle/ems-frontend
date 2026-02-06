const SAFE_METHODS = new Set(["get", "head", "options", "trace"]);

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${escapedName}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function readMeta(name: string): string | null {
  if (typeof document === "undefined") return null;
  const meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  return meta?.content?.trim() ? meta.content.trim() : null;
}

export function getCsrfToken(): string | null {
  const cookieName = process.env.REACT_APP_CSRF_COOKIE_NAME || "XSRF-TOKEN";

  return (
    readMeta("csrf-token") ||
    readMeta("_csrf") ||
    readCookie(cookieName) ||
    null
  );
}

function isAxiosHeaders(
  headers: unknown
): headers is { get: (name: string) => unknown; set: (name: string, value: unknown) => void } {
  return (
    typeof headers === "object" &&
    headers !== null &&
    typeof (headers as any).get === "function" &&
    typeof (headers as any).set === "function"
  );
}

export function applyCsrfHeader<T extends { method?: unknown; headers?: any }>(
  config: T
): T {
  const method = String(config.method ?? "get").toLowerCase();
  if (SAFE_METHODS.has(method)) return config;

  const headerName = process.env.REACT_APP_CSRF_HEADER_NAME || "X-XSRF-TOKEN";
  const token = getCsrfToken();
  if (!token) return config;

  config.headers = config.headers ?? {};
  const headers = config.headers;

  if (isAxiosHeaders(headers)) {
    const existing = headers.get(headerName);
    if (existing == null || existing === "") {
      headers.set(headerName, token);
    }
    return config;
  }

  const headerBag = headers as Record<string, unknown>;
  if (headerBag[headerName] == null || headerBag[headerName] === "") {
    headerBag[headerName] = token;
  }

  return config;
}
