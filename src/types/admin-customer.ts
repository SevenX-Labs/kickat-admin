// types/admin-customer.ts

export type AdminCustomerSortType =
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'name_asc'
  | 'name_desc';

export interface CustomerSummary {
  totalCustomers: number;
  activeCustomersCount: number;
  blockedCustomersCount: number;
  verifiedCustomersCount: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminCustomerItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  gender?: string | null;
  dob?: string | null;
  isProfileComplete: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isBlocked: boolean;
  ordersCount: number;
  petsCount: number;
  addressesCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomersResponse {
  success: boolean;
  data: {
    customers: AdminCustomerItem[];
    pagination: PaginationMeta;
    summary: CustomerSummary;
  };
}

export interface CustomerStats {
  totalOrders: number;
  validOrdersCount: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
  petsCount: number;
  addressesCount: number;
  wishlistCount: number;
  cartCount: number;
}

export interface CustomerAddressItem {
  id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  landmark?: string | null;
  type?: string;
}

export interface CustomerPetItem {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  gender?: string | null;
  age?: number | null;
  weight?: number | null;
  activityLevel?: string | null;
}

export interface AdminCustomerDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  gender?: string | null;
  dob?: string | null;
  isProfileComplete: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isBlocked: boolean;
  stats: CustomerStats;
  addresses: CustomerAddressItem[];
  pets: CustomerPetItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SingleCustomerResponse {
  success: boolean;
  data: AdminCustomerDetail;
}

export interface CustomerOrderHistoryItem {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  grandTotal: number;
  itemsCount: number;
  itemsSummary?: string;
  createdAt: string;
}

export interface CustomerOrdersResponse {
  success: boolean;
  data: {
    customer: {
      id: string;
      name: string;
      email: string | null;
    };
    orders: CustomerOrderHistoryItem[];
    pagination: PaginationMeta;
  };
}

export interface CustomerAddressesResponse {
  success: boolean;
  data: {
    total: number;
    addresses: CustomerAddressItem[];
  };
}

export interface CustomerPetsResponse {
  success: boolean;
  data: {
    total: number;
    pets: CustomerPetItem[];
  };
}

export interface AdminCustomersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isBlocked?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isProfileComplete?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sort?: AdminCustomerSortType | string;
}

export interface CustomerOrdersQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface UpdateCustomerStatusPayload {
  isBlocked: boolean;
  reason?: string;
}

export interface UpdateCustomerStatusResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    isBlocked: boolean;
    updatedAt: string;
  };
}
