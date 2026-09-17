import { AxiosError } from "axios";
import { apiClient } from "./api";
import {
  AdminVaultItem,
  AdminVaultQueryParams,
  AdminVaultResponse,
  CreateVaultCredentialInput,
  SingleVaultCredentialResponse,
  UpdateVaultCredentialInput,
} from "../types/admin-vault";

export const AdminVaultService = {
  /**
   * List all stored credentials with search and category filters
   * GET /api/v1/admin/vault
   */
  async getCredentials(params?: AdminVaultQueryParams): Promise<AdminVaultResponse> {
    const res = await apiClient.get<AdminVaultResponse>("/admin/vault", {
      params,
    });
    return res.data;
  },

  /**
   * Get single credential by ID
   * GET /api/v1/admin/vault/:id
   */
  async getCredentialById(id: string): Promise<AdminVaultItem> {
    const res = await apiClient.get<SingleVaultCredentialResponse>(
      `/admin/vault/${encodeURIComponent(id)}`
    );
    return res.data.data;
  },

  /**
   * Create new password/login credential
   * POST /api/v1/admin/vault
   */
  async createCredential(
    payload: CreateVaultCredentialInput
  ): Promise<AdminVaultItem> {
    const res = await apiClient.post<SingleVaultCredentialResponse>(
      "/admin/vault",
      payload
    );
    return res.data.data;
  },

  /**
   * Edit existing credential
   * PATCH /api/v1/admin/vault/:id
   */
  async updateCredential(
    id: string,
    payload: UpdateVaultCredentialInput
  ): Promise<AdminVaultItem> {
    const res = await apiClient.patch<SingleVaultCredentialResponse>(
      `/admin/vault/${encodeURIComponent(id)}`,
      payload
    );
    return res.data.data;
  },

  /**
   * Delete credential entry
   * DELETE /api/v1/admin/vault/:id
   */
  async deleteCredential(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/vault/${encodeURIComponent(id)}`
    );
    return res.data;
  },

  /**
   * Safe helper to extract formatted error message
   */
  extractErrorMessage(
    err: unknown,
    fallback = "An error occurred in password vault."
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

export default AdminVaultService;
