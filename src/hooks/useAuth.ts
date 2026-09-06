"use client";

import { useEffect, useState } from "react";
import { getStoredToken } from "@/lib/auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    setIsAuthenticated(!!token);
  }, []);

  return { isAuthenticated };
}
