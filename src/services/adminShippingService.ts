// services/adminShippingService.ts
import { AxiosError } from "axios";
import { apiClient } from "./api";
import {
  AdminShipmentsResponse,
  AdminShipmentTrackingResponse,
  AssignCourierPayload,
  AssignCourierResponse,
  UpdateShipmentStatusPayload,
  UpdateShipmentStatusResponse,
  AdminShipmentsQueryParams,
} from "../types/admin-shipping";

export const AdminShippingService = {
  /**
   * 1. List Shipments (Filter by Courier, Status, AWB, Dates, Search)
   * GET /api/v1/admin/shipments
   */
  async getShipments(
    params?: AdminShipmentsQueryParams
  ): Promise<AdminShipmentsResponse> {
    const cleanParams: Record<string, any> = {};

    if (params) {
      if (params.page) cleanParams.page = params.page;
      if (params.limit) cleanParams.limit = params.limit;
      if (params.status && params.status !== "ALL") cleanParams.status = params.status;
      if (params.courier && params.courier.trim()) cleanParams.courier = params.courier.trim();
      if (params.awbNumber && params.awbNumber.trim()) cleanParams.awbNumber = params.awbNumber.trim();
      if (params.orderNumber && params.orderNumber.trim()) cleanParams.orderNumber = params.orderNumber.trim();
      if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (typeof params.isRTO === "boolean") cleanParams.isRTO = params.isRTO;
      if (params.dateFrom) cleanParams.dateFrom = params.dateFrom;
      if (params.dateTo) cleanParams.dateTo = params.dateTo;
      if (params.sort) cleanParams.sort = params.sort;
    }

    const res = await apiClient.get<AdminShipmentsResponse>("/admin/shipments", {
      params: cleanParams,
    });
    return res.data;
  },

  /**
   * 2. Get Single Shipment Details
   * GET /api/v1/admin/shipments/:id
   */
  async getShipmentById(id: string) {
    const res = await apiClient.get<{ success: boolean; data: any }>(
      `/admin/shipments/${encodeURIComponent(id)}`
    );
    return res.data;
  },

  /**
   * 3. Live Tracking Checkpoints & Courier URL
   * GET /api/v1/admin/shipments/:id/tracking
   */
  async getTracking(id: string): Promise<AdminShipmentTrackingResponse> {
    const res = await apiClient.get<AdminShipmentTrackingResponse>(
      `/admin/shipments/${encodeURIComponent(id)}/tracking`
    );
    return res.data;
  },

  /**
   * 4. Assign Courier Partner & Attach AWB Tracking Number
   * POST /api/v1/admin/shipments/:id/assign
   */
  async assignCourier(
    id: string,
    payload: AssignCourierPayload
  ): Promise<AssignCourierResponse> {
    const res = await apiClient.post<AssignCourierResponse>(
      `/admin/shipments/${encodeURIComponent(id)}/assign`,
      payload
    );
    return res.data;
  },

  /**
   * 5. Update Shipment Status & Milestone Location
   * PATCH /api/v1/admin/shipments/:id/status
   */
  async updateStatus(
    id: string,
    payload: UpdateShipmentStatusPayload
  ): Promise<UpdateShipmentStatusResponse> {
    const res = await apiClient.patch<UpdateShipmentStatusResponse>(
      `/admin/shipments/${encodeURIComponent(id)}/status`,
      payload
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

export default AdminShippingService;
