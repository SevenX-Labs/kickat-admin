
// types/admin-auth.ts

export interface AdminUser {
  id: string;
  adminId: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AdminLoginPayload {
  adminId: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  admin: AdminUser;
}

export interface AdminForgotPasswordPayload {
  adminId: string;
}

export interface AdminVerifyOtpPayload {
  adminId: string;
  otp: string;
}

export interface AdminVerifyOtpResponse {
  success: boolean;
  resetToken: string;
  expiresAt: string;
}

export interface AdminResetPasswordPayload {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AdminChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AdminLogoutPayload {
  refreshToken: string;
}

export interface AdminSessionItem {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
}

export interface AdminSessionsResponse {
  success: boolean;
  sessions: AdminSessionItem[];
}

export interface AdminBaseResponse {
  success: boolean;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
  errors: string[];
}
