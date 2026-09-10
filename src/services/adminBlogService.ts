// services/adminBlogService.ts
import { AxiosError } from "axios";
import { apiClient } from "./api";
import {
  AdminBlogsQueryParams,
  BlogCategoriesQueryParams,
  BlogCategoriesResponse,
  BlogsResponse,
  CreateBlogCategoryInput,
  CreateBlogPostInput,
  SingleBlogCategoryResponse,
  SingleBlogPostResponse,
  UpdateBlogCategoryInput,
  UpdateBlogPostInput,
} from "../types/admin-blog";

export const AdminBlogService = {
  /**
   * 1. List Blog Posts with category, tag, search, sort, and publish status filters
   * GET /api/v1/admin/blogs
   */
  async getPosts(params?: AdminBlogsQueryParams): Promise<BlogsResponse> {
    const res = await apiClient.get<BlogsResponse>("/admin/blogs", { params });
    return res.data;
  },

  /**
   * 2. Retrieve Single Blog Post by UUID or Slug
   * GET /api/v1/admin/blogs/:id
   */
  async getPostById(id: string): Promise<SingleBlogPostResponse> {
    const res = await apiClient.get<SingleBlogPostResponse>(
      `/admin/blogs/${encodeURIComponent(id)}`
    );
    return res.data;
  },

  /**
   * 3. Create a New Blog Article
   * POST /api/v1/admin/blogs
   */
  async createPost(
    payload: CreateBlogPostInput
  ): Promise<SingleBlogPostResponse> {
    const res = await apiClient.post<SingleBlogPostResponse>(
      "/admin/blogs",
      payload
    );
    return res.data;
  },

  /**
   * 4. Update Blog Article Details
   * PATCH /api/v1/admin/blogs/:id
   */
  async updatePost(
    id: string,
    payload: UpdateBlogPostInput
  ): Promise<SingleBlogPostResponse> {
    const res = await apiClient.patch<SingleBlogPostResponse>(
      `/admin/blogs/${encodeURIComponent(id)}`,
      payload
    );
    return res.data;
  },

  /**
   * 5. Soft or Permanent Delete Blog Article
   * DELETE /api/v1/admin/blogs/:id
   */
  async deletePost(
    id: string,
    permanent: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/blogs/${encodeURIComponent(id)}`,
      { params: { permanent: String(permanent) } }
    );
    return res.data;
  },

  /**
   * 6. List All Blog Categories with Post Counts
   * GET /api/v1/admin/blog-categories
   */
  async getCategories(
    params?: BlogCategoriesQueryParams
  ): Promise<BlogCategoriesResponse> {
    const res = await apiClient.get<BlogCategoriesResponse>(
      "/admin/blog-categories",
      { params }
    );
    return res.data;
  },

  /**
   * 7. Create a New Blog Category
   * POST /api/v1/admin/blog-categories
   */
  async createCategory(
    payload: CreateBlogCategoryInput
  ): Promise<SingleBlogCategoryResponse> {
    const res = await apiClient.post<SingleBlogCategoryResponse>(
      "/admin/blog-categories",
      payload
    );
    return res.data;
  },

  /**
   * 8. Update Blog Category Details
   * PATCH /api/v1/admin/blog-categories/:id
   */
  async updateCategory(
    id: string,
    payload: UpdateBlogCategoryInput
  ): Promise<SingleBlogCategoryResponse> {
    const res = await apiClient.patch<SingleBlogCategoryResponse>(
      `/admin/blog-categories/${encodeURIComponent(id)}`,
      payload
    );
    return res.data;
  },

  /**
   * 9. Delete a Blog Category
   * DELETE /api/v1/admin/blog-categories/:id
   */
  async deleteCategory(
    id: string,
    permanent: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/blog-categories/${encodeURIComponent(id)}`,
      { params: { permanent: String(permanent) } }
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

export default AdminBlogService;
