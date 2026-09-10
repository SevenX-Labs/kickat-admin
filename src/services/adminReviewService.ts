import { AxiosError } from "axios";
import { apiClient } from "./api";
import {
  AdminReviewsQueryParams,
  AdminReviewsResponse,
  SingleReviewResponse,
  UpdateReviewStatusResponse,
  ReplyReviewResponse,
  ToggleSpamResponse,
  ReviewStatus,
} from "../types/admin-review";

export const AdminReviewService = {
  /**
   * 1. List Reviews (Filter by Status, Star Rating, Spam, Search, Sort, Pagination)
   * GET /api/v1/admin/reviews
   */
  async getReviews(params?: AdminReviewsQueryParams): Promise<AdminReviewsResponse> {
    const res = await apiClient.get<AdminReviewsResponse>("/admin/reviews", {
      params,
    });
    return res.data;
  },

  /**
   * 2. Get Review Details
   * GET /api/v1/admin/reviews/:id
   */
  async getReviewById(id: string): Promise<SingleReviewResponse> {
    const res = await apiClient.get<SingleReviewResponse>(
      `/admin/reviews/${encodeURIComponent(id)}`
    );
    return res.data;
  },

  /**
   * 3. Moderate Review Publishing Status
   * PATCH /api/v1/admin/reviews/:id/status
   */
  async updateStatus(
    id: string,
    status: ReviewStatus,
    rejectionReason?: string
  ): Promise<UpdateReviewStatusResponse> {
    const res = await apiClient.patch<UpdateReviewStatusResponse>(
      `/admin/reviews/${encodeURIComponent(id)}/status`,
      { status, rejectionReason }
    );
    return res.data;
  },

  /**
   * 4. Add or Update Official Store Reply
   * POST /api/v1/admin/reviews/:id/reply
   */
  async reply(id: string, replyText: string): Promise<ReplyReviewResponse> {
    const res = await apiClient.post<ReplyReviewResponse>(
      `/admin/reviews/${encodeURIComponent(id)}/reply`,
      { reply: replyText }
    );
    return res.data;
  },

  /**
   * 5. Flag or Unflag Review as Spam
   * PATCH /api/v1/admin/reviews/:id/spam
   */
  async toggleSpam(id: string, isSpam: boolean): Promise<ToggleSpamResponse> {
    const res = await apiClient.patch<ToggleSpamResponse>(
      `/admin/reviews/${encodeURIComponent(id)}/spam`,
      { isSpam }
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

export default AdminReviewService;
