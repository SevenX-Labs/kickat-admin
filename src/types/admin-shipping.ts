// types/admin-shipping.ts

export type ShipmentStatus =
  | "PLACED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_INITIATED"
  | "RETURNED";

export interface AdminShipmentCustomer {
  id?: string;
  name: string;
  email?: string | null;
  phone: string | null;
  city?: string | null;
  pincode?: string | null;
}

export interface AdminShipmentDestination {
  city: string | null;
  state: string | null;
  pincode: string | null;
  fullAddress: string;
}

export interface AdminShipmentItem {
  id: string;
  orderId?: string;
  shipmentNumber?: string;
  orderNumber: string;
  status: ShipmentStatus;
  courierPartner: string | null;
  awbNumber: string | null;
  estimatedDelivery: string | null;
  isRTO: boolean;
  customer: AdminShipmentCustomer;
  destination?: AdminShipmentDestination;
  itemsCount: number;
  itemsSummary?: string;
  trackingUrl: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminShipmentPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface AdminShipmentSummary {
  totalShipments: number;
  pendingPickup: number;
  shippedCount: number;
  outForDeliveryCount: number;
  deliveredCount: number;
  rtoCount: number;
  pendingAssignmentCount?: number;
  inTransitCount?: number;
}

export interface AdminShipmentTrackingCheckpoint {
  status: string;
  location: string;
  timestamp: string;
}

export interface AdminShipmentTimelineItem {
  stage: string;
  title: string;
  location: string;
  timestamp: string;
  isCompleted: boolean;
  description: string;
}

export interface AdminShipmentTrackingData {
  id?: string;
  orderId?: string;
  orderNumber: string;
  courierPartner: string;
  awbNumber: string;
  status: ShipmentStatus;
  trackingUrl: string;
  checkpoints: AdminShipmentTrackingCheckpoint[];
  timeline?: AdminShipmentTimelineItem[];
  origin?: string;
  destination?: string;
  estimatedDelivery?: string;
  isRTO?: boolean;
}

export interface AdminShipmentTrackingResponse {
  success: boolean;
  data: AdminShipmentTrackingData;
}

export interface AdminShipmentsResponse {
  success: boolean;
  data: {
    shipments: AdminShipmentItem[];
    pagination: AdminShipmentPagination;
    summary: AdminShipmentSummary;
  };
}

export interface AssignCourierPayload {
  courierPartner: string;
  awbNumber?: string;
  estimatedDelivery?: string;
  pickupLocation?: string;
  notes?: string;
}

export interface AssignCourierResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    courierPartner: string;
    awbNumber: string;
    orderStatus: ShipmentStatus;
    trackingUrl: string;
  };
}

export interface UpdateShipmentStatusPayload {
  status: ShipmentStatus;
  location?: string;
  notes?: string;
  deliveredAt?: string;
}

export interface UpdateShipmentStatusResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    status: ShipmentStatus;
    updatedAt: string;
  };
}

export interface AdminShipmentsQueryParams {
  page?: number;
  limit?: number;
  status?: ShipmentStatus | "ALL";
  courier?: string;
  awbNumber?: string;
  orderNumber?: string;
  search?: string;
  isRTO?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sort?: "createdAt_desc" | "createdAt_asc" | "estimatedDelivery_asc";
}
