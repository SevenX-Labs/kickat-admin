// services/adminOrderService.ts
import { AxiosError } from "axios";
import { apiClient } from "./api";
import {
  AdminOrdersResponse,
  AdminOrderDetailResponse,
  AdminOrdersQuery,
  UpdateOrderStatusDto,
  AdminCancelOrderDto,
  AdminRefundOrderDto,
  OrderInvoiceResponse,
  OrderPackingSlipResponse,
} from "../types/admin-order";

export const AdminOrderService = {
  /**
   * 1. List Orders (Search, Filter, Sort, Paginate)
   * GET /api/v1/admin/orders
   */
  async getOrders(params?: AdminOrdersQuery): Promise<AdminOrdersResponse> {
    const res = await apiClient.get<AdminOrdersResponse>("/admin/orders", {
      params,
    });
    return res.data;
  },

  /**
   * 2. Get Order Details by ID or Order Number
   * GET /api/v1/admin/orders/:id
   */
  async getOrderById(id: string): Promise<AdminOrderDetailResponse> {
    const res = await apiClient.get<AdminOrderDetailResponse>(
      `/admin/orders/${encodeURIComponent(id)}`
    );
    return res.data;
  },

  /**
   * 3. Update Order Fulfillment Status & Tracking
   * PATCH /api/v1/admin/orders/:id/status
   */
  async updateStatus(
    id: string,
    payload: UpdateOrderStatusDto
  ): Promise<{ success: boolean; message: string; data: any }> {
    const res = await apiClient.patch<{
      success: boolean;
      message: string;
      data: any;
    }>(`/admin/orders/${encodeURIComponent(id)}/status`, payload);
    return res.data;
  },

  /**
   * 4. Cancel Order & Restock Inventory
   * POST /api/v1/admin/orders/:id/cancel
   */
  async cancelOrder(
    id: string,
    payload: AdminCancelOrderDto
  ): Promise<{ success: boolean; message: string; data: any }> {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/admin/orders/${encodeURIComponent(id)}/cancel`, payload);
    return res.data;
  },

  /**
   * 5. Process Full or Partial Refund
   * POST /api/v1/admin/orders/:id/refund
   */
  async processRefund(
    id: string,
    payload: AdminRefundOrderDto
  ): Promise<{ success: boolean; message: string; data: any }> {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/admin/orders/${encodeURIComponent(id)}/refund`, payload);
    return res.data;
  },

  /**
   * 6. Generate GST Tax Invoice
   * GET /api/v1/admin/orders/:id/invoice
   */
  async getInvoice(id: string): Promise<OrderInvoiceResponse> {
    const res = await apiClient.get<OrderInvoiceResponse>(
      `/admin/orders/${encodeURIComponent(id)}/invoice`
    );
    return res.data;
  },

  /**
   * 7. Generate Warehouse Packing Slip
   * GET /api/v1/admin/orders/:id/packing-slip
   */
  async getPackingSlip(id: string): Promise<OrderPackingSlipResponse> {
    const res = await apiClient.get<OrderPackingSlipResponse>(
      `/admin/orders/${encodeURIComponent(id)}/packing-slip`
    );
    return res.data;
  },

  /**
   * Safe helper to extract formatted error message from backend responses
   */
  extractErrorMessage(
    err: unknown,
    fallback = "An unexpected error occurred."
  ): string {
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

export default AdminOrderService;
