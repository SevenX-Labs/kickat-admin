// services/adminUploadService.ts
import { apiClient } from "./api";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mspqduxvrypexahkkxjz.supabase.co";

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcHFkdXh2cnlwZXhhaGtreGp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTkzNjEzMiwiZXhwIjoyMTAxNTEyMTMyfQ.e9F0LhNIFfuWMsW9wH0idKDOD4yVKXJEFcjlBIBok4Y";

export interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
  size?: number;
  mimetype?: string;
  storageProvider?: string;
}

export const AdminUploadService = {
  /**
   * Uploads an image file for categories, products, or campaigns.
   * First tries the backend /api/v1/admin/upload endpoint.
   * If the backend returns a local/unreachable URL or encounters a storage error,
   * it automatically and transparently uploads directly to Supabase Storage CDN.
   */
  async uploadImage(file: File, folder = "categories"): Promise<UploadResponse> {
    // 1. Client-side MIME validation
    const allowedMime = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedMime.includes(file.type)) {
      throw new Error("Invalid file type. Please upload a valid image (PNG, JPG, WEBP, GIF, SVG).");
    }

    // 2. Client-side size limit (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Image size exceeds 10MB limit. Please upload a smaller image.");
    }

    // Attempt 1: Try backend upload API
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post<{
        success: boolean;
        url: string;
        filename: string;
        size: number;
        mimetype: string;
        storageProvider?: string;
      }>("/admin/upload?minSizeMb=0&maxSizeMb=10", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // If backend returned a valid public CDN URL, return it
      if (
        res.data?.success &&
        res.data.url &&
        !res.data.url.includes("localhost:10000") &&
        !res.data.url.includes("localhost:3000")
      ) {
        return {
          success: true,
          url: res.data.url,
          filename: res.data.filename,
          size: res.data.size,
          mimetype: res.data.mimetype,
          storageProvider: res.data.storageProvider || "backend",
        };
      }
    } catch (backendErr) {
      console.warn("Backend upload failed or returned internal URL, using direct CDN storage fallback:", backendErr);
    }

    // Attempt 2: Direct Supabase Storage CDN Upload (100% reliable fallback)
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
      const fileName = `${folder}/${Date.now()}-${cleanName}`;

      const directRes = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/${fileName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
          "Content-Type": file.type || "image/png",
        },
        body: file,
      });

      if (!directRes.ok) {
        const errText = await directRes.text();
        throw new Error(`CDN upload failed (${directRes.status}): ${errText}`);
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/upload/${fileName}`;
      return {
        success: true,
        url: publicUrl,
        filename: fileName,
        size: file.size,
        mimetype: file.type,
        storageProvider: "supabase-direct",
      };
    } catch (fallbackErr: any) {
      throw new Error(fallbackErr?.message || "Failed to upload image to CDN storage.");
    }
  },
};

export default AdminUploadService;
