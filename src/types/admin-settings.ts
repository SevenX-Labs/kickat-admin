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
  keyId?: string;
  keySecret?: string;
  webhookSecret?: string;
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
  extraFeeName: string | null;
  extraFeeAmount: number;
  isExtraFeeCompulsory: boolean;
}

export interface AdminSettingsForm {
  general: GeneralSettingsState;
  payment: PaymentSettingsState;
  tax: TaxSettingsState;
  delivery: DeliverySettingsState;
}

export interface UpdateAllSettingsDto {
  general?: Partial<GeneralSettingsState>;
  payment?: Partial<PaymentSettingsState>;
  tax?: Partial<TaxSettingsState>;
  delivery?: Partial<DeliverySettingsState>;
}

export interface AdminSettingsResponse<T = AdminSettingsForm> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PublicSettings {
  general: {
    storeName: string;
    socialLinks: SocialLinks;
    supportEmail: string;
    supportPhone: string;
    maintenanceMode: boolean;
  };
  delivery: {
    deliveryFeeEnabled: boolean;
    deliveryFee: number;
    freeDeliveryThreshold: number;
    estimatedDays: number;
    courierDefault: string;
    extraFeeEnabled: boolean;
    extraFeeName: string | null;
    extraFeeAmount: number;
    isExtraFeeCompulsory: boolean;
  };
  tax: {
    gstEnabled: boolean;
    gstPercentage: number;
    gstNumber: string | null;
    gstAppliesToDelivery: boolean;
    taxInclusive: boolean;
  };
  payment: {
    razorpay: MethodToggle;
    cod: CodSettings;
    upi: MethodToggle;
    card: MethodToggle;
    wallet: MethodToggle;
    netbanking: MethodToggle;
  };
}

export interface AdminChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
