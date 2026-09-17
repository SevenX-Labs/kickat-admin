import { AxiosError } from "axios";
import { apiClient } from "./api";
import {
  AdminCampaignsQuery,
  AdminCampaignsResponse,
  Campaign,
  CampaignDetailResponse,
  CampaignStatsResponse,
  CreateCampaignDto,
  UpdateCampaignDto,
} from "../types/admin-campaign";

export const AdminCampaignService = {
  /**
   * 1. List Campaigns with filters and KPI summary
   * GET /api/v1/admin/campaigns
   */
  async getCampaigns(params?: AdminCampaignsQuery): Promise<AdminCampaignsResponse> {
    const res = await apiClient.get<AdminCampaignsResponse>("/admin/campaigns", {
      params,
    });
    return res.data;
  },

  /**
   * 2. Get single campaign configuration & delivery logs
   * GET /api/v1/admin/campaigns/:id
   */
  async getCampaignById(id: string): Promise<CampaignDetailResponse> {
    const res = await apiClient.get<CampaignDetailResponse>(
      `/admin/campaigns/${encodeURIComponent(id)}`
    );
    return res.data;
  },

  /**
   * 3. Create WhatsApp/SMS/Email campaign (Draft or Scheduled)
   * POST /api/v1/admin/campaigns
   */
  async createCampaign(
    payload: CreateCampaignDto
  ): Promise<{ success: boolean; message: string; data: Campaign }> {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: Campaign;
    }>("/admin/campaigns", payload);
    return res.data;
  },

  /**
   * 4. Edit draft or scheduled campaign details
   * PATCH /api/v1/admin/campaigns/:id
   */
  async updateCampaign(
    id: string,
    payload: UpdateCampaignDto
  ): Promise<{ success: boolean; message: string; data: Campaign }> {
    const res = await apiClient.patch<{
      success: boolean;
      message: string;
      data: Campaign;
    }>(`/admin/campaigns/${encodeURIComponent(id)}`, payload);
    return res.data;
  },

  /**
   * 5. Delete draft/cancelled campaign
   * DELETE /api/v1/admin/campaigns/:id
   */
  async deleteCampaign(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/admin/campaigns/${encodeURIComponent(id)}`);
    return res.data;
  },

  /**
   * 6. Trigger immediate broadcast via BullMQ queue
   * POST /api/v1/admin/campaigns/:id/send
   */
  async sendCampaign(
    id: string
  ): Promise<{ success: boolean; message: string; data: any }> {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/admin/campaigns/${encodeURIComponent(id)}/send`);
    return res.data;
  },

  /**
   * 7. Cancel scheduled or active campaign
   * POST /api/v1/admin/campaigns/:id/cancel
   */
  async cancelCampaign(
    id: string
  ): Promise<{ success: boolean; message: string; data: Campaign }> {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: Campaign;
    }>(`/admin/campaigns/${encodeURIComponent(id)}/cancel`);
    return res.data;
  },

  /**
   * 8. Retrieve real-time sent, delivered, failed & pending stats
   * GET /api/v1/admin/campaigns/:id/stats
   */
  async getStats(id: string): Promise<CampaignStatsResponse> {
    const res = await apiClient.get<CampaignStatsResponse>(
      `/admin/campaigns/${encodeURIComponent(id)}/stats`
    );
    return res.data;
  },

  /**
   * Helper to extract formatted error message
   */
  extractErrorMessage(
    err: unknown,
    fallback = "An unexpected error occurred while processing campaign."
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

export default AdminCampaignService;
