import { AxiosError } from "axios";
import api from "./api";
import {
  AdminChangePasswordDto,
  AdminSettingsForm,
  AdminSettingsResponse,
  DeliverySettingsState,
  GeneralSettingsState,
  PaymentSettingsState,
  PublicSettings,
  TaxSettingsState,
  UpdateAllSettingsDto,
} from "../types/admin-settings";

export * from "../types/admin-settings";

export const AdminSettingsService = {
  /**
   * GET /api/v1/admin/settings
   * Retrieve consolidated store settings across all 4 groups (general, payment, tax, delivery)
   */
  async getAll(): Promise<AdminSettingsResponse<AdminSettingsForm>> {
    const res = await api.get<AdminSettingsResponse<AdminSettingsForm>>("/admin/settings");
    return res.data;
  },

  /**
   * PATCH /api/v1/admin/settings
   * Bulk update configurations across multiple groups
   */
  async updateAll(
    payload: UpdateAllSettingsDto
  ): Promise<AdminSettingsResponse<AdminSettingsForm>> {
    const res = await api.patch<AdminSettingsResponse<AdminSettingsForm>>(
      "/admin/settings",
      payload
    );
    return res.data;
  },

  /**
   * POST /api/v1/admin/settings/change-password
   * Authenticated Admin Password Reset within Settings
   */
  async changePassword(
    payload: AdminChangePasswordDto
  ): Promise<{ success: boolean; message: string }> {
    const res = await api.post<{ success: boolean; message: string }>(
      "/admin/settings/change-password",
      payload
    );
    return res.data;
  },

  /**
   * GET /api/v1/admin/settings/general
   */
  async getGeneral(): Promise<AdminSettingsResponse<GeneralSettingsState>> {
    const res = await api.get<AdminSettingsResponse<GeneralSettingsState>>(
      "/admin/settings/general"
    );
    return res.data;
  },

  /**
   * PATCH /api/v1/admin/settings/general
   */
  async updateGeneral(
    payload: Partial<GeneralSettingsState>
  ): Promise<AdminSettingsResponse<GeneralSettingsState>> {
    const res = await api.patch<AdminSettingsResponse<GeneralSettingsState>>(
      "/admin/settings/general",
      payload
    );
    return res.data;
  },

  /**
   * GET /api/v1/admin/settings/payment
   */
  async getPayment(): Promise<AdminSettingsResponse<PaymentSettingsState>> {
    const res = await api.get<AdminSettingsResponse<PaymentSettingsState>>(
      "/admin/settings/payment"
    );
    return res.data;
  },

  /**
   * PATCH /api/v1/admin/settings/payment
   */
  async updatePayment(
    payload: Partial<PaymentSettingsState>
  ): Promise<AdminSettingsResponse<PaymentSettingsState>> {
    const res = await api.patch<AdminSettingsResponse<PaymentSettingsState>>(
      "/admin/settings/payment",
      payload
    );
    return res.data;
  },

  /**
   * GET /api/v1/admin/settings/tax
   */
  async getTax(): Promise<AdminSettingsResponse<TaxSettingsState>> {
    const res = await api.get<AdminSettingsResponse<TaxSettingsState>>(
      "/admin/settings/tax"
    );
    return res.data;
  },

  /**
   * PATCH /api/v1/admin/settings/tax
   */
  async updateTax(
    payload: Partial<TaxSettingsState>
  ): Promise<AdminSettingsResponse<TaxSettingsState>> {
    const res = await api.patch<AdminSettingsResponse<TaxSettingsState>>(
      "/admin/settings/tax",
      payload
    );
    return res.data;
  },

  /**
   * GET /api/v1/admin/settings/delivery
   */
  async getDelivery(): Promise<AdminSettingsResponse<DeliverySettingsState>> {
    const res = await api.get<AdminSettingsResponse<DeliverySettingsState>>(
      "/admin/settings/delivery"
    );
    return res.data;
  },

  /**
   * PATCH /api/v1/admin/settings/delivery
   */
  async updateDelivery(
    payload: Partial<DeliverySettingsState>
  ): Promise<AdminSettingsResponse<DeliverySettingsState>> {
    const res = await api.patch<AdminSettingsResponse<DeliverySettingsState>>(
      "/admin/settings/delivery",
      payload
    );
    return res.data;
  },

  /**
   * GET /api/v1/settings/public
   * Public store configuration API for customer frontend
   */
  async getPublicSettings(): Promise<AdminSettingsResponse<PublicSettings>> {
    const res = await api.get<AdminSettingsResponse<PublicSettings>>("/settings/public");
    return res.data;
  },

  /**
   * Helper to extract formatted error message from backend responses
   */
  extractErrorMessage(
    err: unknown,
    fallback = "Failed to process settings update."
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
            : Array.isArray(respData.message)
            ? respData.message.join(", ")
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

export default AdminSettingsService;
