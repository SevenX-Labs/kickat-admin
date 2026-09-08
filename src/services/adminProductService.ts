// services/adminProductService.ts
import { AxiosError } from "axios";
import { apiClient } from "./api";
import {
  AdminProductsResponse,
  AdminProductItem,
  CreateProductDto,
  UpdateProductDto,
  ProductListParams,
  ProductStatus,
  QuickStockUpdateDto,
} from "../types/admin-product";

export const AdminProductService = {
  /**
   * 1. List Products (Filter, Search, Sort & Paginate)
   * GET /api/v1/admin/products
   */
  async getProducts(params?: ProductListParams): Promise<AdminProductsResponse> {
    const res = await apiClient.get<AdminProductsResponse>("/admin/products", {
      params,
    });
    return res.data;
  },

  /**
   * 2. Get Product by ID or Slug
   * GET /api/v1/admin/products/:id
   */
  async getProductById(id: string): Promise<{ success: boolean; data: AdminProductItem }> {
    const res = await apiClient.get<{ success: boolean; data: AdminProductItem }>(
      `/admin/products/${encodeURIComponent(id)}`
    );
    return res.data;
  },

  /**
   * 3. Create Product (with Variants & Media)
   * POST /api/v1/admin/products
   */
  async createProduct(
    payload: CreateProductDto
  ): Promise<{ success: boolean; message: string; data: AdminProductItem }> {
    const res = await apiClient.post<{ success: boolean; message: string; data: AdminProductItem }>(
      "/admin/products",
      payload
    );
    return res.data;
  },

  /**
   * 4. Update Product
   * PATCH /api/v1/admin/products/:id
   */
  async updateProduct(
    id: string,
    payload: UpdateProductDto
  ): Promise<{ success: boolean; message: string; data: AdminProductItem }> {
    const res = await apiClient.patch<{ success: boolean; message: string; data: AdminProductItem }>(
      `/admin/products/${encodeURIComponent(id)}`,
      payload
    );
    return res.data;
  },

  /**
   * 5. Update Product Status
   * PATCH /api/v1/admin/products/:id/status
   */
  async updateStatus(
    id: string,
    status: ProductStatus
  ): Promise<{ success: boolean; message: string; data: any }> {
    const res = await apiClient.patch<{ success: boolean; message: string; data: any }>(
      `/admin/products/${encodeURIComponent(id)}/status`,
      { status }
    );
    return res.data;
  },

  /**
   * 6. Quick Stock Update (Product & Variants)
   * PATCH /api/v1/admin/products/:id/stock
   */
  async quickUpdateStock(
    id: string,
    payload: QuickStockUpdateDto
  ): Promise<{ success: boolean; message: string; data: any }> {
    const res = await apiClient.patch<{ success: boolean; message: string; data: any }>(
      `/admin/products/${encodeURIComponent(id)}/stock`,
      payload
    );
    return res.data;
  },

  /**
   * 7. Bulk Status Update
   * PATCH /api/v1/admin/products/bulk-status
   */
  async bulkUpdateStatus(
    productIds: string[],
    status: ProductStatus
  ): Promise<{ success: boolean; message: string; data: { updatedCount: number } }> {
    const res = await apiClient.patch<{
      success: boolean;
      message: string;
      data: { updatedCount: number };
    }>("/admin/products/bulk-status", { productIds, status });
    return res.data;
  },

  /**
   * 8. Bulk Delete Products
   * POST /api/v1/admin/products/bulk-delete
   */
  async bulkDelete(
    productIds: string[],
    permanent = false
  ): Promise<{ success: boolean; message: string; data: { deletedCount: number } }> {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: { deletedCount: number };
    }>("/admin/products/bulk-delete", { productIds, permanent });
    return res.data;
  },

  /**
   * 9. Delete Product (Soft or Permanent)
   * DELETE /api/v1/admin/products/:id?permanent=false
   */
  async deleteProduct(
    id: string,
    permanent = false
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/products/${encodeURIComponent(id)}`,
      { params: { permanent } }
    );
    return res.data;
  },

  /**
   * Safe helper to extract formatted error message from backend responses
   */
  extractErrorMessage(err: unknown, fallback = "An unexpected error occurred."): string {
    if (err && typeof err === "object" && "response" in err) {
      const axiosErr = err as AxiosError<any>;
      const respData = axiosErr.response?.data;
      if (respData) {
        if (Array.isArray(respData.errors) && respData.errors.length > 0) {
          return respData.errors.join(", ");
        }
        if (respData.message) {
          return typeof respData.message === "string"
            ? respData.message
            : JSON.stringify(respData.message);
        }
      }
    }
    if (err instanceof Error && err.message) {
      return err.message;
    }
    return fallback;
  },
};

export default AdminProductService;
