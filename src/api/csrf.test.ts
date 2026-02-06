import { applyCsrfHeader, getCsrfToken } from "./csrf";

function setCookie(cookie: string) {
  document.cookie = cookie;
}

describe("csrf", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.cookie = "";
    delete process.env.REACT_APP_CSRF_COOKIE_NAME;
    delete process.env.REACT_APP_CSRF_HEADER_NAME;
  });

  test("getCsrfToken reads default cookie", () => {
    setCookie("XSRF-TOKEN=test-token");
    expect(getCsrfToken()).toBe("test-token");
  });

  test("getCsrfToken prefers meta tag", () => {
    setCookie("XSRF-TOKEN=cookie-token");
    const meta = document.createElement("meta");
    meta.setAttribute("name", "csrf-token");
    meta.setAttribute("content", "meta-token");
    document.head.appendChild(meta);
    expect(getCsrfToken()).toBe("meta-token");
  });

  test("applyCsrfHeader does nothing for safe methods", () => {
    setCookie("XSRF-TOKEN=test-token");
    const cfg = applyCsrfHeader({ method: "get", headers: {} });
    expect(cfg.headers).toEqual({});
  });

  test("applyCsrfHeader adds token for unsafe methods", () => {
    setCookie("XSRF-TOKEN=test-token");
    const cfg = applyCsrfHeader({ method: "post", headers: {} });
    expect((cfg.headers as Record<string, string>)["X-XSRF-TOKEN"]).toBe(
      "test-token"
    );
  });

  test("applyCsrfHeader does not override existing header", () => {
    setCookie("XSRF-TOKEN=test-token");
    const cfg = applyCsrfHeader({
      method: "post",
      headers: { "X-XSRF-TOKEN": "already-set" },
    });
    expect((cfg.headers as Record<string, string>)["X-XSRF-TOKEN"]).toBe(
      "already-set"
    );
  });
});

