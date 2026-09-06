import { apiClient } from "./api";

export const productsService = {
  list: async (params?: Record<string, any>) => {
    const res = await apiClient.get("/admin/products", { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/admin/products/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/admin/products", data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch(`/admin/products/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/admin/products/${id}`);
    return res.data;
  },
};
