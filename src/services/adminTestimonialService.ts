import { AxiosError } from "axios";
import { apiClient } from "./api";
import {
  AdminTestimonialsQueryParams,
  CreateTestimonialInput,
  DeleteTestimonialResponse,
  ReorderTestimonialItem,
  SingleTestimonialResponse,
  Testimonial,
  TestimonialsMeta,
  TestimonialsResponse,
  TestimonialsStats,
  UpdateTestimonialInput,
} from "../types/admin-testimonial";

export const AdminTestimonialService = {
  /**
   * 1. List Testimonials (Pagination, Search, Active Filter)
   * GET /api/v1/admin/testimonials
   */
  async getTestimonials(
    params?: AdminTestimonialsQueryParams
  ): Promise<TestimonialsResponse> {
    const res = await apiClient.get<any>("/admin/testimonials", { params });
    const rootData = res.data?.data || res.data || {};

    const rawList: any[] = Array.isArray(rootData.testimonials)
      ? rootData.testimonials
      : Array.isArray(rootData)
      ? rootData
      : [];

    const testimonials: Testimonial[] = rawList.map((item: any) => ({
      ...item,
      id: item.id,
      name: item.name || item.authorName || "Anonymous Parent",
      authorName: item.authorName || item.name || "Anonymous Parent",
      role: item.role || item.authorTitle || null,
      authorTitle: item.authorTitle || item.role || null,
      authorAvatar: item.authorAvatar || item.avatar || null,
      rating: Number(item.rating) || 5,
      content: item.content || "",
      petName: item.petName || null,
      petType: item.petType || null,
      project: item.project || item.role || item.authorTitle || "General Store",
      isActive: item.isActive ?? true,
      isFeatured: !!item.isFeatured,
      order: Number(item.order) || 0,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));

    const paginationData = rootData.pagination || rootData.meta || {};
    const summaryData = rootData.summary || rootData.stats || {};

    const meta: TestimonialsMeta = {
      total: paginationData.total ?? testimonials.length,
      page: paginationData.page ?? params?.page ?? 1,
      limit: paginationData.limit ?? params?.limit ?? 10,
      totalPages:
        paginationData.totalPages ??
        Math.max(1, Math.ceil((paginationData.total ?? testimonials.length) / (params?.limit ?? 10))),
      hasNextPage: !!paginationData.hasNextPage,
      hasPrevPage: !!paginationData.hasPrevPage,
    };

    const stats: TestimonialsStats = {
      total: summaryData.totalTestimonials ?? summaryData.totalCount ?? summaryData.total ?? testimonials.length,
      active: summaryData.activeCount ?? summaryData.active ?? testimonials.filter((t) => t.isActive).length,
      featured: summaryData.featuredCount ?? summaryData.featured ?? testimonials.filter((t) => t.isFeatured).length,
      averageRating: Number(summaryData.avgRating ?? summaryData.averageRating ?? 5),
    };

    return { testimonials, meta, stats };
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
    const nameVal = payload.name || payload.authorName || "";
    const roleVal = payload.project || payload.role || payload.authorTitle || "";

    const formattedPayload = {
      ...payload,
      name: nameVal,
      authorName: nameVal,
      role: roleVal,
      authorTitle: roleVal,
      project: roleVal,
    };

    const res = await apiClient.post<SingleTestimonialResponse>(
      "/admin/testimonials",
      formattedPayload
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
    const nameVal = payload.name || payload.authorName;
    const roleVal = payload.project || payload.role || payload.authorTitle;

    const formattedPayload = {
      ...payload,
      ...(nameVal !== undefined && { name: nameVal, authorName: nameVal }),
      ...(roleVal !== undefined && { role: roleVal, authorTitle: roleVal, project: roleVal }),
    };

    const res = await apiClient.patch<SingleTestimonialResponse>(
      `/admin/testimonials/${encodeURIComponent(id)}`,
      formattedPayload
    );
    return res.data;
  },

  /**
   * 5. Toggle Active Display Status
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
   * 6. Batch Reorder Testimonials Display Sequence
   * PATCH /api/v1/admin/testimonials/reorder
   */
  async reorderTestimonials(
    items: ReorderTestimonialItem[]
  ): Promise<{ success?: boolean; message: string }> {
    const res = await apiClient.patch<{ success?: boolean; message: string }>(
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
