// types/admin-category.ts

export interface CategorySummary {
  totalCategories: number;
  rootCategoriesCount: number;
  subcategoriesCount?: number;
  subCategoriesCount?: number;
  activeCount: number;
  inactiveCount: number;
}

export interface CategoryCount {
  products: number;
  subcategories: number;
}

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  parentId?: string | null;
  isActive: boolean;
  order: number;
  parent?: { id: string; name: string; slug: string } | null;
  subcategories?: AdminCategoryItem[];
  _count?: CategoryCount;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategoriesResponse {
  success: boolean;
  data: {
    categories: AdminCategoryItem[];
    summary: CategorySummary;
  };
}

export interface CategoryTreeResponse {
  success: boolean;
  data: AdminCategoryItem[] | {
    tree: AdminCategoryItem[];
    totalRootCategories?: number;
  };
}

export interface SingleCategoryResponse {
  success: boolean;
  data: AdminCategoryItem;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  imageUrl?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  order?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  imageUrl?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  order?: number;
}

export interface ReorderCategoryItem {
  id: string;
  order: number;
}

export interface ReorderCategoriesDto {
  items: ReorderCategoryItem[];
}

export type AdminCategorySortEnum =
  | "order_asc"
  | "order_desc"
  | "name_asc"
  | "name_desc"
  | "createdAt_desc"
  | "createdAt_asc";

export interface CategoryListParams {
  search?: string;
  isActive?: boolean;
  parentId?: string;
  isRoot?: boolean;
  tree?: boolean;
  sort?: AdminCategorySortEnum;
}
