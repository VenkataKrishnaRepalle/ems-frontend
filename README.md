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

This frontend uses Keycloak (OIDC) via `keycloak-js` and attaches `Authorization: Bearer <token>` to API requests.

Required env vars:
- `REACT_APP_KEYCLOAK_URL` (e.g. `https://sso.example.com`)
- `REACT_APP_KEYCLOAK_REALM` (e.g. `ems`)
- `REACT_APP_KEYCLOAK_CLIENT_ID` (e.g. `ems-frontend`)

Optional env vars:
- `REACT_APP_API_BASE_URL` (default `http://localhost:8082/api`)
- `REACT_APP_WITH_CREDENTIALS` (set `true` only if your backend needs cookies; default `false`)
- `REACT_APP_KEYCLOAK_SILENT_SSO` (set `true` to enable iframe-based silent SSO using `public/silent-check-sso.html`)
- `REACT_APP_KEYCLOAK_INIT_TIMEOUT_MS` (default `8000`)

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
