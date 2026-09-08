// services/adminCategoryService.ts
import { AxiosError } from "axios";
import { apiClient } from "./api";
import {
  AdminCategoriesResponse,
  CategoryTreeResponse,
  SingleCategoryResponse,
  AdminCategoryItem,
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoryItem,
  CategoryListParams,
} from "../types/admin-category";

export const AdminCategoryService = {
  /**
   * 1. List Categories (Flat or Tree with Summary)
   * GET /api/v1/admin/categories
   */
  async getCategories(params?: CategoryListParams): Promise<AdminCategoriesResponse> {
    const res = await apiClient.get<AdminCategoriesResponse>("/admin/categories", {
      params,
    });
    return res.data;
  },

  /**
   * 2. Get Category Tree Hierarchy
   * GET /api/v1/admin/categories/tree
   */
  async getCategoryTree(): Promise<AdminCategoryItem[]> {
    const res = await apiClient.get<CategoryTreeResponse>("/admin/categories/tree");
    const responseData = res.data?.data;
    
    // Support both direct array format and object with { tree: [...] }
    if (Array.isArray(responseData)) {
      return responseData;
    }
    if (responseData && Array.isArray((responseData as any).tree)) {
      return (responseData as any).tree;
    }
    return [];
  },

  /**
   * 3. Get Category by ID or Slug
   * GET /api/v1/admin/categories/:id
   */
  async getCategoryById(id: string): Promise<AdminCategoryItem> {
    const res = await apiClient.get<SingleCategoryResponse>(`/admin/categories/${encodeURIComponent(id)}`);
    return res.data.data;
  },

  /**
   * 4. Create Category (Root or Subcategory)
   * POST /api/v1/admin/categories
   */
  async createCategory(payload: CreateCategoryDto): Promise<AdminCategoryItem> {
    const res = await apiClient.post<SingleCategoryResponse>("/admin/categories", payload);
    return res.data.data;
  },

  /**
   * 5. Update Category Details
   * PATCH /api/v1/admin/categories/:id
   */
  async updateCategory(id: string, payload: UpdateCategoryDto): Promise<AdminCategoryItem> {
    const res = await apiClient.patch<SingleCategoryResponse>(
      `/admin/categories/${encodeURIComponent(id)}`,
      payload
    );
    return res.data.data;
  },

  /**
   * 6. Toggle Category Active Status
   * PATCH /api/v1/admin/categories/:id/status
   */
  async updateStatus(id: string, isActive: boolean): Promise<{ success: boolean; message?: string }> {
    const res = await apiClient.patch<{ success: boolean; message?: string; data?: any }>(
      `/admin/categories/${encodeURIComponent(id)}/status`,
      { isActive }
    );
    return res.data;
  },

  /**
   * 7. Bulk Reorder Categories Display Sequence
   * PATCH /api/v1/admin/categories/reorder
   */
  async reorderCategories(items: ReorderCategoryItem[]): Promise<{ success: boolean; message?: string }> {
    const res = await apiClient.patch<{ success: boolean; message?: string }>(
      "/admin/categories/reorder",
      { items }
    );
    return res.data;
  },

  /**
   * 8. Delete Category (with Integrity Protections)
   * DELETE /api/v1/admin/categories/:id
   */
  async deleteCategory(id: string, permanent = true): Promise<{ success: boolean; message?: string }> {
    const res = await apiClient.delete<{ success: boolean; message?: string }>(
      `/admin/categories/${encodeURIComponent(id)}`,
      { params: { permanent } }
    );
    return res.data;
  },

  /**
   * Helper: Extract human-readable error from Axios response
   */
  extractErrorMessage(err: unknown, fallback = "An unexpected error occurred."): string {
    if (err && typeof err === "object" && "response" in err) {
      const axiosErr = err as AxiosError<{ message?: string | string[]; error?: string }>;
      const msg = axiosErr.response?.data?.message;
      if (typeof msg === "string") return msg;
      if (Array.isArray(msg) && msg.length > 0) return msg.join(", ");
      if (axiosErr.response?.data?.error) return axiosErr.response.data.error;
    }
    if (err instanceof Error) return err.message;
    return fallback;
  },
};

export default AdminCategoryService;
