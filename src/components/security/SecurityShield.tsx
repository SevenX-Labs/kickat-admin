"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { initConsoleSecurity } from "@/lib/security";
import { getStoredToken, invalidateVaultCache } from "@/lib/auth";

export function SecurityShield() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Initialize Anti-Leak Console Shield immediately
    initConsoleSecurity();

    // 2. Cross-Tab Session Sync & Auto-Logout Listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "_ka_auth_v1" || e.key === null) {
        // Invalidate in-memory cache so fresh tokens from other tabs are picked up
        invalidateVaultCache();

        // ONLY trigger auto-logout if vault was explicitly removed or cleared in another tab
        const isExplicitRemoval =
          (e.key === "_ka_auth_v1" && (e.newValue === null || e.newValue === "")) ||
          (e.key === null && typeof window !== "undefined" && !localStorage.getItem("_ka_auth_v1"));

        if (isExplicitRemoval) {
          const token = getStoredToken();
          if (!token && !pathname.includes("/admin/login")) {
            router.push("/admin/login?session_expired=true");
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router, pathname]);

  return null;
}

export default SecurityShield;
