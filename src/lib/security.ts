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
const VAULT_KEY = "_kickat_sec_v1_admin_#99!";
const textEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
const textDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder() : null;
const VAULT_KEY_BYTES = textEncoder ? textEncoder.encode(VAULT_KEY) : new Uint8Array([95, 107, 105, 99, 107, 97, 116]);

export function encodeVault(data: any): string {
  if (data === null || data === undefined) return "";
  try {
    const jsonStr = JSON.stringify(data);
    if (textEncoder) {
      const bytes = textEncoder.encode(jsonStr);
      const xorBytes = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) {
        xorBytes[i] = bytes[i] ^ VAULT_KEY_BYTES[i % VAULT_KEY_BYTES.length];
      }
      let binary = "";
      for (let i = 0; i < xorBytes.length; i++) {
        binary += String.fromCharCode(xorBytes[i]);
      }
      return "v2_" + btoa(binary);
    }

    return "v2_" + Buffer.from(jsonStr).toString("base64");
  } catch {
    return "";
  }
}

export function decodeVault<T = any>(cipher: string): T | null {
  if (!cipher || typeof cipher !== "string") return null;

  // 1. Try v2 format (Robust byte-level UTF-8)
  if (cipher.startsWith("v2_")) {
    try {
      const rawB64 = cipher.slice(3);
      if (typeof atob === "function" && textDecoder) {
        const binary = atob(rawB64);
        const xorBytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          xorBytes[i] = binary.charCodeAt(i) ^ VAULT_KEY_BYTES[i % VAULT_KEY_BYTES.length];
        }
        return JSON.parse(textDecoder.decode(xorBytes));
      } else {
        const jsonStr = Buffer.from(rawB64, "base64").toString("utf-8");
        return JSON.parse(jsonStr);
      }
    } catch {
      // Continue to fallbacks
    }
  }

  // 2. Try legacy v1 format with stable salt
  try {
    const xor = decodeURIComponent(atob(cipher));
    let raw = "";
    for (let i = 0; i < xor.length; i++) {
      raw += String.fromCharCode(
        xor.charCodeAt(i) ^ VAULT_KEY.charCodeAt(i % VAULT_KEY.length)
      );
    }
    return JSON.parse(raw);
  } catch {}

  // 3. Try legacy v1 format with UA fingerprint (for existing session migration)
  if (typeof window !== "undefined") {
    try {
      const ua = window.navigator.userAgent || "ua";
      const lang = window.navigator.language || "en";
      const oldKey = ua + ":" + lang + ":" + VAULT_KEY;
      const xor = decodeURIComponent(atob(cipher));
      let raw = "";
      for (let i = 0; i < xor.length; i++) {
        raw += String.fromCharCode(
          xor.charCodeAt(i) ^ oldKey.charCodeAt(i % oldKey.length)
        );
      }
      return JSON.parse(raw);
    } catch {}
  }

  // 4. Try plain JSON string (unencrypted fallback)
  try {
    return JSON.parse(cipher);
  } catch {}

  return null;
}
