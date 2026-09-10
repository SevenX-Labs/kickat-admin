// services/adminTestimonialService.ts
import { AxiosError } from "axios";
import { apiClient } from "./api";
import {
  AdminTestimonialsQueryParams,
  AdminTestimonialsResponse,
  CreateTestimonialInput,
  DeleteTestimonialResponse,
  ReorderTestimonialItem,
  SingleTestimonialResponse,
  Testimonial,
  UpdateTestimonialInput,
} from "../types/admin-testimonial";

export const AdminTestimonialService = {
  /**
   * 1. List Testimonials (Pagination, Search, Active, Featured, Rating, Sort)
   * GET /api/v1/admin/testimonials
   */
  async getTestimonials(
    params?: AdminTestimonialsQueryParams
  ): Promise<AdminTestimonialsResponse> {
    const res = await apiClient.get<AdminTestimonialsResponse>(
      "/admin/testimonials",
      { params }
    );
    return res.data;
  },

  /**
   * 2. Get Single Testimonial by ID
   * GET /api/v1/admin/testimonials/:id
   */
  async getTestimonialById(id: string): Promise<SingleTestimonialResponse> {
    const res = await apiClient.get<SingleTestimonialResponse>(
      `/admin/testimonials/${encodeURIComponent(id)}`
    );
    return res.data;
  },

  /**
   * 3. Create a New Homepage Testimonial
   * POST /api/v1/admin/testimonials
   */
  async createTestimonial(
    payload: CreateTestimonialInput
  ): Promise<SingleTestimonialResponse> {
    const res = await apiClient.post<SingleTestimonialResponse>(
      "/admin/testimonials",
      payload
    );
    return res.data;
  },

  /**
   * 4. Update Testimonial Details
   * PATCH /api/v1/admin/testimonials/:id
   */
  async updateTestimonial(
    id: string,
    payload: UpdateTestimonialInput
  ): Promise<SingleTestimonialResponse> {
    const res = await apiClient.patch<SingleTestimonialResponse>(
      `/admin/testimonials/${encodeURIComponent(id)}`,
      payload
    );
    return res.data;
  },

  /**
   * 5. Toggle Active / Live Status
   * PATCH /api/v1/admin/testimonials/:id/status
   */
  async toggleStatus(
    id: string,
    isActive: boolean
  ): Promise<SingleTestimonialResponse> {
    const res = await apiClient.patch<SingleTestimonialResponse>(
      `/admin/testimonials/${encodeURIComponent(id)}/status`,
      { isActive }
    );
    return res.data;
  },

  /**
   * 6. Reorder Testimonials
   * PATCH /api/v1/admin/testimonials/reorder
   */
  async reorderTestimonials(
    items: ReorderTestimonialItem[]
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.patch<{ success: boolean; message: string }>(
      "/admin/testimonials/reorder",
      { items }
    );
    return res.data;
  },

  /**
   * 7. Delete Testimonial (Soft or Permanent)
   * DELETE /api/v1/admin/testimonials/:id
   */
  async deleteTestimonial(
    id: string,
    permanent = false
  ): Promise<DeleteTestimonialResponse> {
    const res = await apiClient.delete<DeleteTestimonialResponse>(
      `/admin/testimonials/${encodeURIComponent(id)}`,
      { params: { permanent } }
    );
    return res.data;
  },

  /**
   * Helper: Extract human-readable error from Axios response
   */
  extractErrorMessage(
    err: unknown,
    fallback = "An unexpected error occurred."
  ): string {
    if (err && typeof err === "object" && "response" in err) {
      const axiosErr = err as AxiosError<{
        message?: string | string[];
        error?: string;
      }>;
      const msg = axiosErr.response?.data?.message;
      if (typeof msg === "string") return msg;
      if (Array.isArray(msg) && msg.length > 0) return msg.join(", ");
      if (axiosErr.response?.data?.error) return axiosErr.response.data.error;
    }
    if (err instanceof Error) return err.message;
    return fallback;
  },
};

export default AdminTestimonialService;
