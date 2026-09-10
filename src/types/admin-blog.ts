export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content?: string;
  summary?: string | null;
  coverImage?: string | null;
  category?: string | null;
  categoryId?: string | null;
  blogCategory?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  } | null;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string | null;
  authorName?: string | null;
  viewCount: number;
  readTimeMinutes: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  order: number;
  isActive: boolean;
  postsCount?: number;
  _count?: {
    posts: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BlogPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface BlogSummary {
  totalPosts: number;
  publishedCount: number;
  draftCount: number;
  totalViews?: number;
}

export interface BlogsResponse {
  success: boolean;
  message?: string;
  data: {
    posts: BlogPost[];
    pagination: BlogPagination;
    summary: BlogSummary;
  };
}

export interface SingleBlogPostResponse {
  success: boolean;
  message?: string;
  data: BlogPost;
}

export interface BlogCategoriesResponse {
  success: boolean;
  message?: string;
  data: {
    total: number;
    categories: BlogCategory[];
  };
}

export interface SingleBlogCategoryResponse {
  success: boolean;
  message?: string;
  data: BlogCategory;
}

export interface CreateBlogPostInput {
  title: string;
  slug?: string;
  content: string;
  summary?: string;
  coverImage?: string;
  categoryId?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
  publishedAt?: string;
  authorName?: string;
}

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;

export interface CreateBlogCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  order?: number;
  isActive?: boolean;
}

export type UpdateBlogCategoryInput = Partial<CreateBlogCategoryInput>;

export interface AdminBlogsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  tag?: string;
  isPublished?: boolean;
  sort?: "createdAt_desc" | "createdAt_asc" | "title_asc" | "viewCount_desc";
}

export interface BlogCategoriesQueryParams {
  search?: string;
  isActive?: boolean;
}
