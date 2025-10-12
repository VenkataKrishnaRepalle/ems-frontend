// src/api/api.ts
import axios, {AxiosError, AxiosInstance} from "axios";
import {toast} from "react-toastify";
import {ErrorResponse} from "../components/types/types.d";

const API_BASE_URL = "http://localhost:8082/api";

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Ensure all requests include cookies
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const status = error.response.status;
            const errorData = error?.response?.data as ErrorResponse;
            if (status === 404 || status === 400) {
                toast.error(errorData.error.message);
            } else if (status === 401 || status === 403) {
                toast.error("Session expired. Please login again.");
                // window.location.href = "/";
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