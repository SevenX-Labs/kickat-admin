export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "MODERATOR";
  avatar?: string;
}

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kickat_admin_token");
};

export const setStoredToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("kickat_admin_token", token);
  }
};

export const removeStoredToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("kickat_admin_token");
    localStorage.removeItem("kickat_admin_user");
  }
};
