"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { initConsoleSecurity } from "@/lib/security";
import { getStoredToken } from "@/lib/auth";

export function SecurityShield() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Initialize Anti-Leak Console Shield immediately
    initConsoleSecurity();

    // 2. Cross-Tab Session Sync & Auto-Logout Listener
    const handleStorageChange = (e: StorageEvent) => {
      // If vault key was removed or storage cleared in another tab
      if (e.key === "_ka_auth_v1" || e.key === null) {
        const token = getStoredToken();
        if (!token && !pathname.includes("/admin/login")) {
          router.push("/admin/login?session_expired=true");
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
