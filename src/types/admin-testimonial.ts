export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  avatarUrl: string | null;
  rating: number;
  content: string;
  petName: string | null;
  petType: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTestimonialsSummary {
  totalTestimonials: number;
  activeCount: number;
  featuredCount: number;
  avgRating: number;
}

export interface AdminTestimonialsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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
  role?: string;
  avatarUrl?: string;
  rating?: number;
  content: string;
  petName?: string;
  petType?: string;
  imageUrl?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
}

export type UpdateTestimonialInput = Partial<CreateTestimonialInput>;

export interface AdminTestimonialsResponse {
  success: boolean;
  data: {
    testimonials: Testimonial[];
    pagination: AdminTestimonialsPagination;
    summary: AdminTestimonialsSummary;
  };
}

export interface SingleTestimonialResponse {
  success: boolean;
  message?: string;
  data: Testimonial;
}

export interface DeleteTestimonialResponse {
  success: boolean;
  message: string;
}

export interface ReorderTestimonialItem {
  id: string;
  order: number;
}

export interface ReorderTestimonialsInput {
  items: ReorderTestimonialItem[];
}
