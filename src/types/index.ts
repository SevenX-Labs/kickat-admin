export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "MODERATOR";
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category: { id: string; name: string };
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  images: string[];
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  itemCount: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: "ACTIVE" | "BLOCKED";
  createdAt: string;
}

export * from "./admin-testimonial";
