export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AdminReviewSortEnum =
  | "createdAt_desc"
  | "createdAt_asc"
  | "rating_desc"
  | "rating_asc"
  | "helpfulCount_desc";

export interface AdminReviewUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface AdminReviewProduct {
  id: string;
  name: string;
  slug?: string | null;
  imageUrl?: string | null;
  rating?: number;
  reviewsCount?: number;
}

export interface AdminReviewItem {
  id: string;
  productId: string;
  productName?: string;
  productSlug?: string | null;
  userId?: string | null;
  orderId?: string | null;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  photos?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  status: ReviewStatus;
  isSpam: boolean;
  adminReply?: string | null;
  adminReplyAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  user: AdminReviewUser;
  product: AdminReviewProduct;
  customer?: AdminReviewUser | null;
  order?: {
    id: string;
    orderNumber: string;
    orderStatus?: string;
    createdAt?: string;
  } | null;
}

export interface AdminReviewsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface AdminReviewsSummary {
  totalReviews: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  spamCount: number;
  averageRating: number;
}

export interface AdminReviewsQueryParams {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
  isSpam?: boolean;
  rating?: number;
  productId?: string;
  search?: string;
  sort?: AdminReviewSortEnum | string;
}

export interface AdminReviewsResponse {
  success: boolean;
  data: {
    reviews: AdminReviewItem[];
    pagination: AdminReviewsPagination;
    summary: AdminReviewsSummary;
  };
}

export interface SingleReviewResponse {
  success: boolean;
  data: AdminReviewItem;
}

export interface UpdateReviewStatusResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: ReviewStatus;
    rejectionReason?: string | null;
    updatedAt: string;
  };
}

export interface ReplyReviewResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    adminReply: string;
    adminReplyAt?: string;
    updatedAt: string;
  };
}

export interface ToggleSpamResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    isSpam: boolean;
    status: ReviewStatus;
    updatedAt: string;
  };
}
