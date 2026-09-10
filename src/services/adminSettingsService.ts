import api from './api';

export interface GeneralSettings {
  siteName?: string;
  siteDescription?: string;
  supportEmail?: string;
  supportPhone?: string;
  logoUrl?: string;
  faviconUrl?: string;
  maintenanceMode?: boolean;
  smtp?: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    isSecure?: boolean;
    fromEmail?: string;
  };
}

export interface StoreSettings {
  storeName?: string;
  legalBusinessName?: string;
  currency?: string;
  currencySymbol?: string;
  country?: string;
  timezone?: string;
  orderPrefix?: string;
  invoicePrefix?: string;
  minOrderValue?: number;
  maxOrderValue?: number;
  autoCancelUnpaidMinutes?: number;
}

export interface PaymentSettings {
  razorpay?: {
    enabled?: boolean;
    keyId?: string;
    keySecret?: string;
    webhookSecret?: string;
  };
  cod?: {
    enabled?: boolean;
    maxAmount?: number;
    extraFee?: number;
  };
  upi?: { enabled?: boolean };
  wallet?: { enabled?: boolean };
  card?: { enabled?: boolean };
  netbanking?: { enabled?: boolean };
}

export interface TaxSettings {
  taxEnabled?: boolean;
  gstNumber?: string;
  standardGstRate?: number;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  hsnCodes?: Record<string, string>;
  pricesIncludeTax?: boolean;
}

export interface DeliverySettings {
  standardDeliveryFee?: number;
  freeDeliveryThreshold?: number;
  estimatedDeliveryDays?: number;
  defaultCourier?: string;
  supportedCouriers?: string[];
  deliverySlots?: string[];
  enableRtoTracking?: boolean;
}

export interface ConsolidatedSettings {
  general?: GeneralSettings;
  store?: StoreSettings;
  payment?: PaymentSettings;
  tax?: TaxSettings;
  delivery?: DeliverySettings;
}

export const AdminSettingsService = {
  async getAll() {
    const res = await api.get<{ success: boolean; data: ConsolidatedSettings }>('/admin/settings');
    return res.data;
  },

  async updateAll(payload: ConsolidatedSettings) {
    const res = await api.patch<{ success: boolean; data: ConsolidatedSettings }>('/admin/settings', payload);
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

  async getStore() {
    const res = await api.get<{ success: boolean; data: StoreSettings }>('/admin/settings/store');
    return res.data;
  },

  async updateStore(payload: StoreSettings) {
    const res = await api.patch<{ success: boolean; data: StoreSettings }>('/admin/settings/store', payload);
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
