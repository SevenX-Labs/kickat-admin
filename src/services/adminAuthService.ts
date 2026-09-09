import { adminApiClient } from "./api";
import {
  setStoredAuth,
  removeStoredToken,
  getStoredRefreshToken,
} from "@/lib/auth";
import {
  AdminLoginPayload,
  AdminLoginResponse,
  AdminRefreshTokenResponse,
  AdminForgotPasswordPayload,
  AdminVerifyOtpPayload,
  AdminVerifyOtpResponse,
  AdminResetPasswordPayload,
  AdminChangePasswordPayload,
  AdminSessionsResponse,
  AdminBaseResponse,
  AdminUser,
} from "../types/admin-auth";

export const AdminAuthService = {
  /**
   * 1. Admin Login
   * Authenticates admin credentials, creates a tracking session in the database
   * and stores access/refresh tokens in localStorage.
   */
  async login(payload: AdminLoginPayload, rememberMe = true): Promise<AdminLoginResponse> {
    const res = await adminApiClient.post<AdminLoginResponse>("/login", {
      ...payload,
      rememberMe,
    });
    const { accessToken, refreshToken, admin } = res.data;

    if (typeof window !== "undefined") {
      setStoredAuth(accessToken, refreshToken, admin, rememberMe);
    }

    return res.data;
  },

  /**
   * 1b. Refresh Tokens & Extend Session
   * Sends active refreshToken to rotate access & refresh tokens statefully,
   * updating browser vault and extending database session.
   */
  async refreshToken(): Promise<AdminRefreshTokenResponse> {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const res = await adminApiClient.post<AdminRefreshTokenResponse>("/refresh", {
      refreshToken,
    });
    const { accessToken, refreshToken: newRefresh, admin } = res.data;
    if (typeof window !== "undefined") {
      setStoredAuth(accessToken, newRefresh, admin);
    }
    return res.data;
  },

  /**
   * 2. Request Forgot Password OTP
   * Sends 6-digit password reset OTP to admin registered email.
   */
  async forgotPassword(payload: AdminForgotPasswordPayload): Promise<AdminBaseResponse> {
    const res = await adminApiClient.post<AdminBaseResponse>("/forgot-password", payload);
    return res.data;
  },

  /**
   * 3. Verify Reset OTP
   * Verifies 6-digit OTP and obtains temporary resetToken valid for 10 minutes.
   */
  async verifyResetOtp(payload: AdminVerifyOtpPayload): Promise<AdminVerifyOtpResponse> {
    const res = await adminApiClient.post<AdminVerifyOtpResponse>("/verify-reset-otp", payload);
    return res.data;
  },

  /**
   * 4. Reset Password
   * Resets admin password using verified resetToken.
   */
  async resetPassword(payload: AdminResetPasswordPayload): Promise<AdminBaseResponse> {
    const res = await adminApiClient.post<AdminBaseResponse>("/reset-password", payload);
    return res.data;
  },

  /**
   * 5. Change Password (Authenticated)
   * Enables authenticated admin to change password by verifying existing currentPassword.
   */
  async changePassword(payload: AdminChangePasswordPayload): Promise<AdminBaseResponse> {
    const res = await adminApiClient.post<AdminBaseResponse>("/change-password", payload);
    return res.data;
  },

  /**
   * 6. Admin Logout
   * Invalidates refresh token and active session in database, clears client tokens.
   */
  async logout(): Promise<AdminBaseResponse> {
    const refreshToken = getStoredRefreshToken() || "";
    try {
      const res = await adminApiClient.post<AdminBaseResponse>("/logout", { refreshToken });
      return res.data;
    } catch {
      return { success: true, message: "Logged out successfully" };
    } finally {
      removeStoredToken();
    }
  },

  /**
   * 7. Get Current Admin Profile (/me)
   * Retrieves profile details and permissions of the currently authenticated admin.
   */
  async getProfile(): Promise<{ success: boolean; admin: AdminUser }> {
    const res = await adminApiClient.get<{ success: boolean; admin: AdminUser }>("/me");
    return res.data;
  },

  /**
   * 8. List Active Sessions
   * Returns all active, non-revoked sessions for the authenticated admin.
   */
  async getSessions(): Promise<AdminSessionsResponse> {
    const res = await adminApiClient.get<AdminSessionsResponse>("/sessions");
    return res.data;
  },

  /**
   * 9. Revoke Active Session
   * Revokes an active session by its UUID.
   */
  async revokeSession(sessionId: string): Promise<AdminBaseResponse> {
    const res = await adminApiClient.delete<AdminBaseResponse>(`/sessions/${sessionId}`);
    return res.data;
  },
};

export default AdminAuthService;
