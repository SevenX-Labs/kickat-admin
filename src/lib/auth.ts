import { AdminUser } from "@/types/admin-auth";
import { encodeVault, decodeVault } from "./security";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  adminId?: string;
  avatar?: string;
}

interface AuthVault {
  accessToken: string;
  refreshToken?: string;
  admin?: AdminUser;
  rememberMe?: boolean;
  timestamp: number;
}

const STORAGE_VAULT_KEY = "_ka_auth_v1";

const LEGACY_STORAGE_KEYS = [
  "admin_access_token",
  "admin_refresh_token",
  "admin_profile",
  "kickat_admin_token",
  "kickat_admin_user",
];

function purgeLegacyPlaintext(): void {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }
}

function readVault(): AuthVault | null {
  if (typeof window === "undefined") return null;

  try {
    // 1. Check localStorage first
    let rawCipher = localStorage.getItem(STORAGE_VAULT_KEY);

    // 2. Check sessionStorage if not in localStorage
    if (!rawCipher) {
      rawCipher = sessionStorage.getItem(STORAGE_VAULT_KEY);
    }

    if (rawCipher) {
      const decrypted = decodeVault<AuthVault>(rawCipher);
      if (decrypted && decrypted.accessToken) {
        return decrypted;
      }
    }

    // 3. Fallback: Migration of legacy plain text keys if any exist
    const legacyToken =
      localStorage.getItem("admin_access_token") ||
      localStorage.getItem("kickat_admin_token");

    if (legacyToken) {
      const legacyRefresh = localStorage.getItem("admin_refresh_token") || undefined;
      let legacyAdmin: AdminUser | undefined;
      try {
        const rawAdmin = localStorage.getItem("admin_profile") || localStorage.getItem("kickat_admin_user");
        if (rawAdmin) legacyAdmin = JSON.parse(rawAdmin);
      } catch {
        // ignore
      }

      const migratedVault: AuthVault = {
        accessToken: legacyToken,
        refreshToken: legacyRefresh,
        admin: legacyAdmin,
        rememberMe: true,
        timestamp: Date.now(),
      };

      // Store in encrypted vault and purge plain text
      setStoredAuth(migratedVault.accessToken, migratedVault.refreshToken, migratedVault.admin, true);
      purgeLegacyPlaintext();
      return migratedVault;
    }
  } catch {
    return null;
  }

  return null;
}

export const getStoredToken = (): string | null => {
  const vault = readVault();
  return vault?.accessToken || null;
};

export const getStoredRefreshToken = (): string | null => {
  const vault = readVault();
  return vault?.refreshToken || null;
};

export const getStoredAdmin = (): AdminUser | null => {
  const vault = readVault();
  return vault?.admin || null;
};

export const setStoredAuth = (
  accessToken: string,
  refreshToken?: string,
  admin?: AdminUser,
  rememberMe = true
): void => {
  if (typeof window === "undefined") return;

  // Sanitize admin object: keep only necessary non-sensitive UI fields
  const safeAdmin: AdminUser | undefined = admin
    ? {
        id: admin.id,
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || [],
      }
    : undefined;

  const vault: AuthVault = {
    accessToken,
    refreshToken,
    admin: safeAdmin,
    rememberMe,
    timestamp: Date.now(),
  };

  const cipher = encodeVault(vault);

  try {
    if (rememberMe) {
      localStorage.setItem(STORAGE_VAULT_KEY, cipher);
      sessionStorage.removeItem(STORAGE_VAULT_KEY);
    } else {
      sessionStorage.setItem(STORAGE_VAULT_KEY, cipher);
      localStorage.removeItem(STORAGE_VAULT_KEY);
    }
  } catch {
    // Fallback if storage quota is constrained
  }

  // Ensure zero plain text leaks exist in browser storage
  purgeLegacyPlaintext();
};

export const setStoredToken = (token: string): void => {
  setStoredAuth(token);
};

export const removeStoredToken = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_VAULT_KEY);
    sessionStorage.removeItem(STORAGE_VAULT_KEY);
  } catch {
    // Ignore errors
  }

  purgeLegacyPlaintext();

  // Notify other tabs via storage broadcast event to sync logout
  try {
    window.dispatchEvent(new Event("storage"));
  } catch {
    // Ignore errors
  }
};
