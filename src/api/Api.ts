import axios, {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from "axios";
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

// Token refresh state management
let isRefreshing = false;
let failedRequestsQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

// Process queued requests after token refresh
const processQueue = (error: any = null) => {
    failedRequestsQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    failedRequestsQueue = [];
};

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
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        if (error.response) {
            const status = error.response.status;
            const errorData = error?.response?.data as ErrorResponse;
            
            // Handle 401 Unauthorized - Token expired
            if (status === 401 && originalRequest && !originalRequest._retry) {
                if (isRefreshing) {
                    // Token refresh is already in progress, queue this request
                    return new Promise((resolve, reject) => {
                        failedRequestsQueue.push({
                            resolve: () => resolve(api(originalRequest)),
                            reject: (err) => reject(err)
                        });
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    // Call refresh token API directly to avoid circular dependency
                    const response = await axios.post(
                        `${API_BASE_URL}/auth/refresh-token`,
                        {},
                        { withCredentials: true }
                    );

                    if (response.status === 200) {
                        toast.success("Session refreshed successfully.");
                        isRefreshing = false;
                        processQueue(); // Process all queued requests
                        
                        // Retry the original request
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh token failed - redirect to login
                    isRefreshing = false;
                    processQueue(refreshError);
                    toast.error("Session expired. Please login again.");
                    
                    // Redirect to login page
                    window.location.href = "/";
                    return Promise.reject(refreshError);
                }
            } 
            // Handle 403 Forbidden - Access denied
            else if (status === 403) {
                toast.error("Don't have privileged access to view");
            } 
            // Handle 404 Not Found or 400 Bad Request
            else if (status === 404 || status === 400) {
                toast.error(errorData?.error?.message || "Request failed");
            } 
            // Handle 500+ Server errors
            else if (status >= 500) {
                toast.error("Server error. Please try again later.");
            } 
            // Handle other errors
            else {
                toast.error("An error occurred.");
            }
        } else {
            toast.error("Network error. Please check your connection.");
        }

        return Promise.reject(error);
    }
);

export default api;
