export interface Testimonial {
  id: string;
  name?: string;
  authorName?: string;
  role?: string | null;
  authorTitle?: string | null;
  authorAvatar?: string | null;
  rating: number;
  content: string;
  petName?: string | null;
  petType?: string | null;
  project?: string | null;
  isActive: boolean;
  isFeatured?: boolean;
  order: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface TestimonialsStats {
  total: number;
  active: number;
  featured?: number;
  averageRating: number;
}

export interface TestimonialsResponse {
  testimonials: Testimonial[];
  meta: TestimonialsMeta;
  stats: TestimonialsStats;
}

export interface AdminTestimonialsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  rating?: number;
  project?: string;
  sort?: "order_asc" | "order_desc" | "createdAt_desc" | "createdAt_asc" | "rating_desc" | "rating_asc";
}

export interface CreateTestimonialInput {
  name?: string;
  authorName?: string;
  role?: string;
  authorTitle?: string;
  authorAvatar?: string | null;
  content: string;
  rating?: number;
  petName?: string;
  petType?: string;
  project?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
}

export type UpdateTestimonialInput = Partial<CreateTestimonialInput>;

export interface SingleTestimonialResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data: Testimonial;
}

export interface DeleteTestimonialResponse {
  success?: boolean;
  statusCode?: number;
  message: string;
}

export interface ReorderTestimonialItem {
  id: string;
  order: number;
}

export interface ReorderTestimonialsInput {
  items: ReorderTestimonialItem[];
}
