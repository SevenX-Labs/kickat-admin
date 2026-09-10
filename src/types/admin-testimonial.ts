export interface Testimonial {
  id: string;
  name: string;
  role?: string | null;
  rating: number;
  content: string;
  petName?: string | null;
  petType?: string | null;
  isActive: boolean;
  isFeatured: boolean;
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
}

export interface TestimonialsStats {
  total: number;
  active: number;
  featured: number;
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
  sort?: "order_asc" | "order_desc" | "createdAt_desc" | "createdAt_asc" | "rating_desc" | "rating_asc";
}

export interface CreateTestimonialInput {
  name: string;
  content: string;
  rating?: number;
  role?: string;
  petName?: string;
  petType?: string;
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
