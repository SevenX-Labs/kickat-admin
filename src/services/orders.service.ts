import { apiClient } from "./api";

export const ordersService = {
  list: async (params?: Record<string, any>) => {
    const res = await apiClient.get("/admin/orders", { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/admin/orders/${id}`);
    return res.data;
  },
  updateStatus: async (id: string, status: string, notes?: string) => {
    const res = await apiClient.patch(`/admin/orders/${id}/status`, { status, notes });
    return res.data;
  },
  cancel: async (id: string, reason: string) => {
    const res = await apiClient.post(`/admin/orders/${id}/cancel`, { reason });
    return res.data;
  },
  getInvoice: async (id: string) => {
    const res = await apiClient.get(`/admin/orders/${id}/invoice`);
    return res.data;
  },
};
