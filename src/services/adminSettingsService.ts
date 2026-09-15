import api from "./api";

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
}

export interface GeneralSettingsState {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  socialLinks: SocialLinks;
}

export interface RazorpaySettings {
  enabled: boolean;
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

export interface CodSettings {
  enabled: boolean;
  minOrderAmount: number;
  maxOrderAmount: number;
  extraFeeEnabled: boolean;
  extraFee: number;
}

export interface MethodToggle {
  enabled: boolean;
}

export interface PaymentSettingsState {
  razorpay: RazorpaySettings;
  cod: CodSettings;
  upi: MethodToggle;
  card: MethodToggle;
  wallet: MethodToggle;
  netbanking: MethodToggle;
}

export interface TaxSettingsState {
  gstEnabled: boolean;
  gstNumber: string | null;
  gstPercentage: number;
  gstAppliesToDelivery: boolean;
  taxInclusive: boolean;
}

export interface DeliverySettingsState {
  deliveryFeeEnabled: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  estimatedDays: number;
  courierDefault: string;
  extraFeeEnabled: boolean;
  extraFeeName: string;
  extraFeeAmount: number;
  isExtraFeeCompulsory: boolean;
}

export interface AdminSettingsForm {
  general: GeneralSettingsState;
  payment: PaymentSettingsState;
  tax: TaxSettingsState;
  delivery: DeliverySettingsState;
}

export const AdminSettingsService = {
  /**
   * Retrieve consolidated store settings across all 4 groups
   */
  async getAll() {
    const res = await api.get<{ success: boolean; data: AdminSettingsForm }>("/admin/settings");
    return res.data;
  },

  /**
   * Bulk update configurations across multiple groups
   */
  async updateAll(payload: Partial<AdminSettingsForm>) {
    const res = await api.patch<{ success: boolean; data: AdminSettingsForm }>("/admin/settings", payload);
    return res.data;
  },

  /**
   * General store settings
   */
  async getGeneral() {
    const res = await api.get<{ success: boolean; data: GeneralSettingsState }>("/admin/settings/general");
    return res.data;
  },

  async updateGeneral(payload: Partial<GeneralSettingsState>) {
    const res = await api.patch<{ success: boolean; data: GeneralSettingsState }>("/admin/settings/general", payload);
    return res.data;
  },

  /**
   * Payment gateway configurations
   */
  async getPayment() {
    const res = await api.get<{ success: boolean; data: PaymentSettingsState }>("/admin/settings/payment");
    return res.data;
  },

  async updatePayment(payload: Partial<PaymentSettingsState>) {
    const res = await api.patch<{ success: boolean; data: PaymentSettingsState }>("/admin/settings/payment", payload);
    return res.data;
  },

  /**
   * Tax calculation rules
   */
  async getTax() {
    const res = await api.get<{ success: boolean; data: TaxSettingsState }>("/admin/settings/tax");
    return res.data;
  },

  async updateTax(payload: Partial<TaxSettingsState>) {
    const res = await api.patch<{ success: boolean; data: TaxSettingsState }>("/admin/settings/tax", payload);
    return res.data;
  },

  /**
   * Delivery & Shipping fee rules
   */
  async getDelivery() {
    const res = await api.get<{ success: boolean; data: DeliverySettingsState }>("/admin/settings/delivery");
    return res.data;
  },

  async updateDelivery(payload: Partial<DeliverySettingsState>) {
    const res = await api.patch<{ success: boolean; data: DeliverySettingsState }>("/admin/settings/delivery", payload);
    return res.data;
  },

  /**
   * Public Store Configuration API
   */
  async getPublicSettings() {
    const res = await api.get<{ success: boolean; data: any }>("/settings/public");
    return res.data;
  },
};
