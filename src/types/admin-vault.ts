export interface AdminVaultItem {
  id: string;
  adminId: string;
  title: string;
  usernameOrEmail: string;
  password: string;
  url?: string | null;
  notes?: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaultCredentialInput {
  title: string;
  usernameOrEmail: string;
  password: string;
  url?: string;
  notes?: string;
  category?: string;
}

export interface UpdateVaultCredentialInput {
  title?: string;
  usernameOrEmail?: string;
  password?: string;
  url?: string;
  notes?: string;
  category?: string;
}

export interface AdminVaultQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
}

export interface VaultCategorySummary {
  name: string;
  count: number;
}

export interface AdminVaultResponse {
  success: boolean;
  data: {
    credentials: AdminVaultItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    summary: {
      totalCredentials: number;
      categories: VaultCategorySummary[];
    };
  };
}

export interface SingleVaultCredentialResponse {
  success: boolean;
  message?: string;
  data: AdminVaultItem;
}
