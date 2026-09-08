// types/admin-product.ts

export type ProductStatus = "ACTIVE" | "DRAFT" | "INACTIVE";
export type PetSpecies = "DOG" | "CAT" | "BIRD" | "FISH" | "RABBIT" | "OTHER";
export type DietaryPreference = "VEG" | "NON_VEG" | "BOTH";

export type AdminProductSortEnum =
  | "createdAt_desc"
  | "createdAt_asc"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc"
  | "stock_asc"
  | "stock_desc"
  | "rating_desc";

export interface CustomProductAttribute {
  label: string;
  value: string;
}

export interface ProductAttributes {
  material?: string;
  lifeStage?: string;
  weight?: string;
  colors?: string[];
  countryOfOrigin?: string;
  dimensions?: string;
  custom?: CustomProductAttribute[];
}

export interface ProductHighlight {
  title: string;
  description: string;
  icon?: string;
}

export interface NutritionItem {
  label: string;
  value: string;
}

export interface ProductIngredients {
  description?: string;
  items?: string[];
  nutrition?: NutritionItem[];
}

export interface FeedingRow {
  petWeight: string;
  dailyAmount: string;
}

export interface ProductFeedingGuide {
  description?: string;
  rows?: FeedingRow[];
}

export interface SizeItem {
  label: string;
  description: string;
}

export interface ProductSizeGuide {
  enabled?: boolean;
  description?: string;
  sizes?: SizeItem[];
  note?: string;
}

export interface ProductVariant {
  id?: string;
  productId?: string;
  name: string;
  sku?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  attributes?: Record<string, any>;
  imageUrl?: string | null;
}

export interface ProductMedia {
  id: string;
  productId?: string;
  type: "IMAGE";
  url: string;
  thumbnailUrl?: string | null;
  order: number;
}

export interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  descriptionTitle?: string | null;
  description?: string | null;
  materials?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  petSpecies?: PetSpecies | null;
  dietaryPreference?: DietaryPreference | null;
  categoryId: string;
  imageUrl: string;
  images: string[];
  status: ProductStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  attributes?: ProductAttributes | null;
  highlights?: ProductHighlight[] | null;
  ingredients?: ProductIngredients | null;
  feedingGuide?: ProductFeedingGuide | null;
  careInstructions?: string[];
  sizeGuide?: ProductSizeGuide | null;
  isTrending: boolean;
  isBestSeller: boolean;
  rating: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  variants: ProductVariant[];
  media: ProductMedia[];
  _count?: {
    reviews: number;
    variants: number;
    wishlistItems?: number;
    cartItems?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductSummary {
  totalProducts: number;
  activeCount: number;
  draftCount: number;
  inactiveCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface AdminProductsResponse {
  success: boolean;
  data: {
    products: AdminProductItem[];
    pagination: ProductPagination;
    summary: ProductSummary;
  };
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  categoryId?: string;
  petSpecies?: PetSpecies;
  dietaryPreference?: DietaryPreference;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isLowStock?: boolean;
  lowStockThreshold?: number;
  isTrending?: boolean;
  isBestSeller?: boolean;
  sort?: AdminProductSortEnum;
}

export interface CreateProductDto {
  name: string;
  slug?: string;
  descriptionTitle?: string | null;
  description?: string | null;
  materials?: string | null;
  price: number;
  discountPrice?: number | null;
  stock?: number;
  petSpecies?: PetSpecies | null;
  dietaryPreference?: DietaryPreference | null;
  categoryId: string;
  images: string[];
  status?: ProductStatus;
  isTrending?: boolean;
  isBestSeller?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  attributes?: ProductAttributes | null;
  highlights?: ProductHighlight[] | null;
  ingredients?: ProductIngredients | null;
  feedingGuide?: ProductFeedingGuide | null;
  careInstructions?: string[];
  sizeGuide?: ProductSizeGuide | null;
  variants?: Array<{
    name: string;
    sku?: string | null;
    price: number;
    discountPrice?: number | null;
    stock: number;
    attributes?: Record<string, any>;
    imageUrl?: string | null;
  }>;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  variants?: Array<{
    id?: string;
    name: string;
    sku?: string | null;
    price: number;
    discountPrice?: number | null;
    stock: number;
    attributes?: Record<string, any>;
    imageUrl?: string | null;
  }>;
}

export interface QuickStockVariantItem {
  variantId: string;
  stock: number;
}

export interface QuickStockUpdateDto {
  stock?: number;
  variantStocks?: QuickStockVariantItem[];
}
