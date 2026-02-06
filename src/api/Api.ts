import axios, { AxiosError, AxiosHeaders, AxiosInstance } from "axios";
import {toast} from "react-toastify";
import {ErrorResponse} from "../components/types/types.d";
import { applyCsrfHeader } from "./csrf";
import { ensureFreshToken } from "../auth/keycloak";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8082/api";
const WITH_CREDENTIALS = (process.env.REACT_APP_WITH_CREDENTIALS ?? "true").toLowerCase() === "true";

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: WITH_CREDENTIALS,
});

api.interceptors.request.use(
    async (config) => {
        const token = await ensureFreshToken(30);
        if (token) {
            const authValue = `Bearer ${token}`;
            if (!config.headers) {
                (config as any).headers = new AxiosHeaders();
            }

            if (config.headers instanceof AxiosHeaders) {
                config.headers.set("Authorization", authValue);
            } else {
                (config.headers as any).Authorization = authValue;
            }
        }
        return applyCsrfHeader(config);
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        if (error.response) {
            const status = error.response.status;
            const errorData = error?.response?.data as ErrorResponse | any;
            if (status === 404 || status === 400) {
                const msg =
                    errorData?.error?.message ||
                    errorData?.message ||
                    (typeof errorData === "string" ? errorData : null) ||
                    `Request failed (${status})`;
                toast.error(msg);
            } else if (status === 401) {
                toast.error("Unauthorized. Please login again.");
            } else if (status === 403) {
                toast.error("Don't have privileged access to view");
            } else if (status >= 500) {
                toast.error("Server error. Please try again later.");
            } else {
                toast.error("An error occurred.");
            }
        } else {
            toast.error("Network error. Please check your connection.");
        }

        return Promise.reject(error);
    }
);

export default api;
