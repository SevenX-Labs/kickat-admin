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

// In-memory session cache for zero-latency lookups and resilience against storage read locks
let memoryVault: AuthVault | null = null;

export function invalidateVaultCache(): void {
  memoryVault = null;
}

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
  // 1. Fast in-memory cache return
  if (memoryVault && memoryVault.accessToken) {
    return memoryVault;
  }

  if (typeof window === "undefined") return null;

  try {
    // 2. Check localStorage first
    let rawCipher = localStorage.getItem(STORAGE_VAULT_KEY);

    // 3. Check sessionStorage if not in localStorage
    if (!rawCipher) {
      rawCipher = sessionStorage.getItem(STORAGE_VAULT_KEY);
    }

    if (rawCipher) {
      const decrypted = decodeVault<AuthVault>(rawCipher);
      if (decrypted && decrypted.accessToken) {
        memoryVault = decrypted;

        // Proactively upgrade legacy encrypted format to v2 UTF-8 format
        if (!rawCipher.startsWith("v2_")) {
          try {
            const upgradedCipher = encodeVault(decrypted);
            if (upgradedCipher) {
              if (decrypted.rememberMe !== false) {
                localStorage.setItem(STORAGE_VAULT_KEY, upgradedCipher);
              } else {
                sessionStorage.setItem(STORAGE_VAULT_KEY, upgradedCipher);
              }
            }
          } catch {
            // Non-fatal
          }
        }

        return decrypted;
      }
    }

    // 4. Fallback: Migration of legacy plain text keys if any exist
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

      setStoredAuth(migratedVault.accessToken, migratedVault.refreshToken, migratedVault.admin, true);
      purgeLegacyPlaintext();
      memoryVault = migratedVault;
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
  rememberMe?: boolean
): void => {
  if (typeof window === "undefined") return;
  if (!accessToken || typeof accessToken !== "string") return;

  const existingVault = memoryVault || readVault();
  const effectiveRememberMe =
    rememberMe !== undefined ? rememberMe : (existingVault?.rememberMe ?? true);

  // Sanitize admin object: keep only necessary non-sensitive UI fields
  const safeAdmin: AdminUser | undefined =
    admin !== undefined
      ? admin
        ? {
            id: admin.id,
            adminId: admin.adminId,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions || [],
          }
        : undefined
      : existingVault?.admin;

  const effectiveRefreshToken =
    refreshToken !== undefined && refreshToken !== ""
      ? refreshToken
      : existingVault?.refreshToken;

  const vault: AuthVault = {
    accessToken,
    refreshToken: effectiveRefreshToken,
    admin: safeAdmin,
    rememberMe: effectiveRememberMe,
    timestamp: Date.now(),
  };

  // Keep memory cache updated synchronously
  memoryVault = vault;

  const cipher = encodeVault(vault);
  if (!cipher) return;

  try {
    if (effectiveRememberMe) {
      localStorage.setItem(STORAGE_VAULT_KEY, cipher);
      sessionStorage.removeItem(STORAGE_VAULT_KEY);
    } else {
      sessionStorage.setItem(STORAGE_VAULT_KEY, cipher);
      localStorage.removeItem(STORAGE_VAULT_KEY);
    }
  } catch {
    // Fallback in restricted storage contexts
    try {
      sessionStorage.setItem(STORAGE_VAULT_KEY, cipher);
    } catch {}
  }

  // Ensure zero plain text leaks exist in browser storage
  purgeLegacyPlaintext();
};

export const setStoredToken = (token: string): void => {
  setStoredAuth(token);
};

export const removeStoredToken = (): void => {
  memoryVault = null;

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
