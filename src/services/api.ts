import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import {
  getStoredToken,
  getStoredRefreshToken,
  setStoredAuth,
  removeStoredToken,
} from "@/lib/auth";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.kickat.co.in/api/v1";

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function handleSessionExpired() {
  if (typeof window === "undefined") return;
  removeStoredToken();
  if (!window.location.pathname.includes("/admin/login")) {
    window.location.href = "/admin/login?session_expired=true";
  }
}

function attachAuthInterceptors(instance: AxiosInstance) {
  // Request Interceptor: Attach Access Token to all outgoing requests
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = getStoredToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Response Interceptor: Silent Token Refresh on 401 Unauthorized
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

      if (!originalRequest || error.response?.status !== 401) {
        return Promise.reject(error);
      }

      const requestUrl = originalRequest.url || "";
      const isAuthBypassUrl =
        requestUrl.includes("/login") ||
        requestUrl.includes("/refresh") ||
        requestUrl.includes("/forgot-password") ||
        requestUrl.includes("/verify-reset-otp") ||
        requestUrl.includes("/reset-password");

      // Do not attempt refresh on auth entrypoint errors or if already retried
      if (isAuthBypassUrl || originalRequest._retry) {
        if (!isAuthBypassUrl && originalRequest._retry) {
          handleSessionExpired();
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = getStoredRefreshToken();

      if (!currentRefreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        handleSessionExpired();
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        axios
          .post<{
            success: boolean;
            accessToken: string;
            refreshToken: string;
            admin: any;
          }>(
            `${BASE_URL}/admin/auth/refresh`,
            { refreshToken: currentRefreshToken },
            { withCredentials: true }
          )
          .then(({ data }) => {
            if (data?.accessToken) {
              setStoredAuth(data.accessToken, data.refreshToken, data.admin);
              processQueue(null, data.accessToken);
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
              }
              resolve(instance(originalRequest));
            } else {
              throw new Error("Invalid token refresh response");
            }
          })
          .catch((refreshErr) => {
            processQueue(refreshErr, null);
            handleSessionExpired();
            reject(refreshErr);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }
  );
}

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
attachAuthInterceptors(apiClient);

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
attachAuthInterceptors(adminApiClient);

export default apiClient;
