import { AdminAuthService } from "./adminAuthService";

export { AdminAuthService };

export const authService = {
  ...AdminAuthService,
  /**
   * Backwards-compatible login wrapper that supports both adminId and email fields
   */
  login: async (credentials: { adminId?: string; email?: string; password: string }) => {
    return AdminAuthService.login({
      adminId: credentials.adminId || credentials.email || "",
      password: credentials.password,
    });
  },
};

export default authService;
