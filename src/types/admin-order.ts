// types/admin-order.ts

export type OrderStatus =
  | "PENDING"
  | "PLACED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_INITIATED"
  | "RETURNED";

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

export type AdminOrderSortEnum =
  | "createdAt_desc"
  | "createdAt_asc"
  | "grandTotal_desc"
  | "grandTotal_asc";

export interface OrderCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface OrderAddress {
  id?: string;
  name?: string;
  street?: string;
  houseFlat?: string;
  buildingStreet?: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
  country?: string;
  phone?: string;
}

export interface OrderItemDetail {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  quantity: number;
  price: number;
  totalPrice: number;
  productImage?: string;
}

export interface OrderPaymentRecord {
  id: string;
  paymentMethod: string;
  status: PaymentStatus;
  amount: number;
  transactionId?: string | null;
  failureReason?: string | null;
  createdAt: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  notes?: string;
}

export interface AdminOrderItem {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  shippingAddress?: OrderAddress;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  itemsCount: number;
  itemsSummary: string;
  items?: OrderItemDetail[];
  trackingNumber?: string | null;
  courierPartner?: string | null;
  estimatedDelivery?: string | null;
  hasReturns?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderSummary {
  totalOrders: number;
  totalRevenue: number;
  placedCount?: number;
  pendingCount?: number;
  processingCount: number;
  packedCount?: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
  returnedCount?: number;
}

export interface AdminOrderPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminOrdersResponse {
  success: boolean;
  data: {
    orders: AdminOrderItem[];
    pagination: AdminOrderPagination;
    summary: AdminOrderSummary;
  };
}

export interface AdminOrderDetail extends AdminOrderItem {
  discount?: number;
  notes?: string | null;
  user?: OrderCustomer;
  address?: OrderAddress;
  items: OrderItemDetail[];
  payments: OrderPaymentRecord[];
  timeline?: OrderTimelineEvent[];
  cancelReason?: string | null;
  cancelReasonOther?: string | null;
  cancelledAt?: string | null;
  returns?: any[];
}

export interface AdminOrderDetailResponse {
  success: boolean;
  data: AdminOrderDetail;
}

export interface AdminOrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: AdminOrderSortEnum;
  orderId?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  courierPartner?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface AdminCancelOrderDto {
  reason: string;
  reasonOther?: string;
  restockItems?: boolean;
}

export interface AdminRefundOrderDto {
  amount?: number;
  reason: string;
  refundMethod?: string;
  notes?: string;
}

export interface OrderInvoiceItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: string;
  taxAmount: number;
}

export interface OrderInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  orderId: string;
  orderNumber: string;
  customer: OrderCustomer;
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  items: OrderInvoiceItem[];
  summary: {
    subtotal: number;
    taxBreakdown: {
      cgst: number;
      sgst: number;
      totalTax: number;
    };
    deliveryFee: number;
    grandTotal: number;
  };
  payment: {
    method: string;
    status: string;
  };
  downloadUrl?: string;
}

export interface OrderInvoiceResponse {
  success: boolean;
  data: OrderInvoiceData;
}

export interface PackingSlipItem {
  itemNumber: number;
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName: string;
  quantity: number;
  picked?: boolean;
}

export interface OrderPackingSlipData {
  slipNumber: string;
  orderNumber: string;
  orderDate: string;
  customer: {
    name: string;
    phone: string | null;
  };
  shippingAddress: OrderAddress;
  deliverySlot?: string;
  deliveryInstructions?: string | null;
  courierPartner?: string;
  trackingNumber?: string;
  packageItems: PackingSlipItem[];
  totalItemsCount: number;
  totalUnitsCount: number;
  barcode: string;
  generatedAt: string;
}

export interface OrderPackingSlipResponse {
  success: boolean;
  data: OrderPackingSlipData;
}

export const formatAddress = (addr?: OrderAddress | null): string => {
  if (!addr) return "No address provided";
  const parts = [
    addr.houseFlat,
    addr.buildingStreet,
    addr.street,
    addr.landmark,
    addr.city,
    addr.state,
    addr.pincode ? `${addr.pincode}` : undefined,
    addr.country,
  ].filter(Boolean);
  return parts.join(", ");
};
