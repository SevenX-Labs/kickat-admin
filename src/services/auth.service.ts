import { apiClient } from "./api";

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post("/admin/auth/login", credentials);
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await apiClient.post("/admin/auth/forgot-password", { email });
    return res.data;
  },
  resetPassword: async (data: { token: string; password: string }) => {
    const res = await apiClient.post("/admin/auth/reset-password", data);
    return res.data;
  },
  getProfile: async () => {
    const res = await apiClient.get("/admin/auth/me");
    return res.data;
  },
};
