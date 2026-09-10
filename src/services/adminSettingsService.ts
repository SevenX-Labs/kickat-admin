import api from './api';

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
}

export interface GeneralSettings {
  supportEmail?: string;
  supportPhone?: string;
  maintenanceMode?: boolean;
  socialLinks?: SocialLinks;
}

export interface PaymentSettings {
  cod?: {
    enabled?: boolean;
    extraFee?: number;
  };
  upi?: {
    enabled?: boolean;
  };
  card?: {
    enabled?: boolean;
  };
}

export interface TaxSettings {
  gstEnabled?: boolean;
  gstNumber?: string;
  gstPercentage?: number;
}

export interface DeliverySettings {
  deliveryFeeEnabled?: boolean;
  deliveryFee?: number;
  freeDeliveryThreshold?: number;
}

export interface ConsolidatedSettings {
  general?: GeneralSettings;
  payment?: PaymentSettings;
  tax?: TaxSettings;
  delivery?: DeliverySettings;
}

export const AdminSettingsService = {
  async getAll() {
    const res = await api.get<{ success: boolean; data: ConsolidatedSettings }>('/admin/settings');
    return res.data;
  },

  async getGeneral() {
    const res = await api.get<{ success: boolean; data: GeneralSettings }>('/admin/settings/general');
    return res.data;
  },

  async updateGeneral(payload: GeneralSettings) {
    const res = await api.patch<{ success: boolean; data: GeneralSettings }>('/admin/settings/general', payload);
    return res.data;
  },

  async getPayment() {
    const res = await api.get<{ success: boolean; data: PaymentSettings }>('/admin/settings/payment');
    return res.data;
  },

  async updatePayment(payload: PaymentSettings) {
    const res = await api.patch<{ success: boolean; data: PaymentSettings }>('/admin/settings/payment', payload);
    return res.data;
  },

  async getTax() {
    const res = await api.get<{ success: boolean; data: TaxSettings }>('/admin/settings/tax');
    return res.data;
  },

  async updateTax(payload: TaxSettings) {
    const res = await api.patch<{ success: boolean; data: TaxSettings }>('/admin/settings/tax', payload);
    return res.data;
  },

  async getDelivery() {
    const res = await api.get<{ success: boolean; data: DeliverySettings }>('/admin/settings/delivery');
    return res.data;
  },

  async updateDelivery(payload: DeliverySettings) {
    const res = await api.patch<{ success: boolean; data: DeliverySettings }>('/admin/settings/delivery', payload);
    return res.data;
  },
};
