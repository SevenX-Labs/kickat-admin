import axios, { AxiosError } from "axios";
import { getStoredToken, removeStoredToken } from "@/lib/auth";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.kickat.co.in/api/v1";

/**
 * Root API client targeting base URL (default: https://api.kickat.co.in/api/v1)
 * Used across the application for orders, products, customers, and root routes.
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Attach Access Token to all outgoing requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor: Automatically handle 401 Unauthorized (session expiry)
apiClient.interceptors.response.use(  
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      removeStoredToken();
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login?session_expired=true";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Dedicated Admin Auth API client targeting /api/v1/admin/auth
 * As documented in the Admin Authentication API specification.
 */
export const adminApiClient = axios.create({
  baseURL: `${BASE_URL}/admin/auth`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

adminApiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

adminApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      removeStoredToken();
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login?session_expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
