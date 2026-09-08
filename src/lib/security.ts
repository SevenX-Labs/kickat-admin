/**
 * Security & Anti-Leak Module for KickAt Admin
 * Prevents sensitive data leakage in Browser Console and Browser Storage.
 */

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /otp/i,
  /credential/i,
  /authorization/i,
  /bearer/i,
  /cookie/i,
  /apikey/i,
  /access_token/i,
  /refresh_token/i,
  /reset_token/i,
];

const JWT_PATTERN = /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g;
const BEARER_PATTERN = /Bearer\s+[a-zA-Z0-9_\-\.]+/gi;

/**
 * Deep sanitization for any argument passed to console or logs
 */
export function sanitizeData(data: any, seen = new WeakSet()): any {
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    return data
      .replace(JWT_PATTERN, "[REDACTED_JWT]")
      .replace(BEARER_PATTERN, "Bearer [REDACTED_TOKEN]");
  }

  if (typeof data === "number" || typeof data === "boolean") {
    return data;
  }

  if (typeof data === "object") {
    if (seen.has(data)) return "[CIRCULAR]";
    seen.add(data);

    if (Array.isArray(data)) {
      return data.map((item) => sanitizeData(item, seen));
    }

    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) =>
        pattern.test(key)
      );
      if (isSensitive) {
        clean[key] = "[PROTECTED]";
      } else {
        clean[key] = sanitizeData(value, seen);
      }
    }
    return clean;
  }

  return data;
}

/**
 * Global Console Shield:
 * Suppresses info, debug, log, table, dir in client environments
 * and deeply scrubs warn and error calls so zero credentials/tokens/PII leak to DevTools.
 */
let isConsoleShieldInitialized = false;

export function initConsoleSecurity(): void {
  if (typeof window === "undefined" || isConsoleShieldInitialized) return;
  isConsoleShieldInitialized = true;

  const noop = () => {};
  const isProduction = process.env.NODE_ENV === "production";

  // In production, suppress general console outputs completely
  if (isProduction) {
    window.console.log = noop;
    window.console.info = noop;
    window.console.debug = noop;
    window.console.dir = noop;
    window.console.table = noop;
    window.console.trace = noop;
  } else {
    // In development/staging, sanitize all console.log arguments to prevent accidental credential printing
    const originalLog = window.console.log;
    window.console.log = (...args: any[]) => {
      originalLog(...args.map((a) => sanitizeData(a)));
    };
  }

  // Always sanitize errors and warnings
  const originalWarn = window.console.warn;
  window.console.warn = (...args: any[]) => {
    originalWarn(...args.map((a) => sanitizeData(a)));
  };

  const originalError = window.console.error;
  window.console.error = (...args: any[]) => {
    originalError(...args.map((a) => sanitizeData(a)));
  };
}

/**
 * Storage Vault Encryption / Obfuscation
 * Prevents raw tokens and plain-text JSON profiles from appearing in
 * DevTools -> Application -> Storage -> Local Storage / Session Storage.
 */
const VAULT_SALT = "_kickat_sec_v1_admin_#99!";

function getClientFingerprint(): string {
  if (typeof window === "undefined") return VAULT_SALT;
  const nav = window.navigator;
  const ua = nav.userAgent || "ua";
  const lang = nav.language || "en";
  return ua + ":" + lang + ":" + VAULT_SALT;
}

function xorTransform(text: string, key: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

export function encodeVault(data: any): string {
  try {
    const raw = JSON.stringify(data);
    const key = getClientFingerprint();
    const xor = xorTransform(raw, key);
    return btoa(encodeURIComponent(xor));
  } catch {
    return "";
  }
}

export function decodeVault<T = any>(cipher: string): T | null {
  try {
    const key = getClientFingerprint();
    const xor = decodeURIComponent(atob(cipher));
    const raw = xorTransform(xor, key);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
