# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## CSRF (Cross-Site Request Forgery)

This frontend sends cookies (`withCredentials: true`) and automatically attaches a CSRF token header for non-GET requests.

- Default cookie name: `XSRF-TOKEN`
- Default header name: `X-XSRF-TOKEN`
- Override via env vars: `REACT_APP_CSRF_COOKIE_NAME`, `REACT_APP_CSRF_HEADER_NAME`

Notes:
- Your backend must issue a readable CSRF token (via cookie like `XSRF-TOKEN` or a `<meta name="csrf-token" content="...">` tag).
- If your frontend (`http://localhost:3000`) calls a backend on another origin (like `http://localhost:8082`), your backend must allow credentialed CORS and set cookies appropriately (often `SameSite=None; Secure` for cross-site cookies).

## Keycloak Login

This frontend supports **two login modes**:

1) **Keycloak SSO (OIDC)** via `keycloak-js` (Bearer token on API calls)
2) **Legacy email/password** via backend session cookies (existing `/auth/login` flow)

The Login page shows both options.

### How the Keycloak flow works (end-to-end)

**Key files**
- Keycloak client + helpers: `src/auth/keycloak.ts`
- Auth bootstrap + login/logout helpers: `src/auth/AuthContext.tsx`
- Route guard for protected pages: `src/auth/RequireAuth.tsx`
- API client (adds Bearer token / cookies): `src/api/Api.ts`
- Login UI (two options): `src/components/auth/Login.tsx`
- Logout UI: `src/components/auth/Logout.tsx`
- Protected routes are wrapped in `<RequireAuth>`: `src/App.tsx`
- Optional silent SSO page: `public/silent-check-sso.html`

**Startup / initialization**
1) `src/App.tsx` wraps the router in `<AuthProvider>`.
2) `AuthProvider` checks whether Keycloak is configured by reading env vars.
3) If configured, it calls `keycloak.init()` (default mode: `onLoad: "check-sso"`).
   - `check-sso` means: "if the browser already has an SSO session, authenticate silently; otherwise stay unauthenticated without forcing a redirect."
4) `AuthProvider` only tracks Keycloak state (`initialized` / `authenticated`).
5) Protected routes (`<RequireAuth>`) load the app profile via `GET /employee/me` (`ME_API`) and store it in Redux (`setEmployee`).

**Click "Login with Keycloak"**
1) `src/components/auth/Login.tsx` calls `login()` from `AuthContext`.
2) `login()` calls `keycloak.login()` which **redirects the browser** to Keycloak.
3) After successful login at Keycloak, Keycloak redirects back to this SPA (usually `http://localhost:3000/`).
4) On return, `keycloak-js` processes the callback, sets `keycloak.authenticated`, and exposes the access token at `keycloak.token`.
5) The Login page navigates to `/dashboard`.
6) `<RequireAuth>` loads `/employee/me` and then renders the dashboard.

**Calling APIs after Keycloak login**
- `src/api/Api.ts` runs a request interceptor on every API call:
  - Calls `ensureFreshToken(30)` (refresh token if needed)
  - Adds `Authorization: Bearer <access_token>`
  - Also applies CSRF header on non-safe methods (for legacy cookie mode)

### How redirect to dashboard happens

There are two ways the app can reach `/dashboard`:

- **Keycloak mode**: after Keycloak redirects back, `AuthProvider` sets `authenticated=true` and fetches `/employee/me`. Then `Login.tsx` navigates to `/dashboard`.
- **Legacy mode**: after successful `/auth/login`, `Login.tsx` sets the Redux employee and navigates to `/dashboard`.

In both modes, protected pages are guarded with `<RequireAuth>` in `src/App.tsx`.

### Legacy email/password flow (cookie session)

1) User submits email/password in `src/components/auth/Login.tsx`.
2) Frontend calls `POST /auth/login` via `LOGIN_API` (`src/api/Auth.ts`).
3) Backend returns the employee payload (used to populate Redux) and usually sets session cookies.
4) Frontend dispatches `setEmployee(...)` and navigates to `/dashboard`.
5) Subsequent requests use cookies (`withCredentials` in `src/api/Api.ts`) and CSRF header for non-GET requests (`src/api/csrf.ts`).

### Route protection (why you won't see infinite spinners on 401)

`src/auth/RequireAuth.tsx` is responsible for protected routes:
- If Redux already has `employee.uuid`, it renders the page.
- Otherwise it attempts `ME_API()` once.
  - If it succeeds, it sets Redux employee and renders the page.
  - If it fails (401/403/etc), it redirects to `/` (Login) instead of letting a protected page mount and get stuck.

### Required Keycloak env vars

Required env vars:
- `REACT_APP_KEYCLOAK_URL` (e.g. `https://sso.example.com`)
- `REACT_APP_KEYCLOAK_REALM` (e.g. `ems`)
- `REACT_APP_KEYCLOAK_CLIENT_ID` (e.g. `ems-frontend`)

### Optional env vars
- `REACT_APP_API_BASE_URL` (default `http://localhost:8082/api`)
- `REACT_APP_WITH_CREDENTIALS` (default `true`; set `false` if you do not use cookies at all)
- `REACT_APP_KEYCLOAK_SILENT_SSO` (default `false`; set `true` to enable iframe-based silent SSO using `public/silent-check-sso.html`)
- `REACT_APP_KEYCLOAK_INIT_TIMEOUT_MS` (default `8000`)

### Keycloak client configuration (must match your SPA)

In Keycloak Admin Console for client `ems-frontend`:
- **Valid Redirect URIs**: `http://localhost:3000/*`
- **Web Origins**: `http://localhost:3000` (or `+` for dev)
- Ensure the client is configured for **Authorization Code Flow + PKCE** (recommended; the frontend uses `pkceMethod: "S256"`).

### Backend expectations (Keycloak mode)

When using Keycloak, the backend at `REACT_APP_API_BASE_URL` must accept:
- `Authorization: Bearer <access_token>` for authenticated endpoints like `GET /employee/me`

Common patterns are:
- Backend validates JWT access token directly (using Keycloak realm public keys / JWKS)
- Or backend exchanges/validates tokens via Keycloak introspection (less common for SPA access tokens)

### Troubleshooting

**Login page keeps loading / spinner**
- Keycloak init can hang if silent SSO is enabled but the Keycloak client doesn't allow the redirect. Keep `REACT_APP_KEYCLOAK_SILENT_SSO=false` unless you specifically need it.
- Increase/adjust `REACT_APP_KEYCLOAK_INIT_TIMEOUT_MS` if Keycloak is slow in your environment.

**`/employee/me` returns 401 even though you have a token**
- Confirm the request has `Authorization: Bearer ...` in the Network tab.
- Ensure your backend is configured as a resource server for the same realm and accepts tokens issued for `ems-frontend` (audience/client configuration matters).

**`/employee/me` returns 400**
- This is usually a backend validation/parsing error (not “unauthorized”). Check the backend response body for the real reason.
- Common causes: backend expects cookies/session but receives Bearer token (or vice-versa), or JWT validation is misconfigured.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
