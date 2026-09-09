// types/admin-dashboard.ts
// KickAt Admin Executive Dashboard API Types & Interfaces

export type DashboardPeriod =
  | "today"
  | "this_week"
  | "7d"
  | "this_month"
  | "30d"
  | "this_year"
  | "12m"
  | "all"
  | "custom";

export type ChartGroupBy = "hour" | "day" | "week" | "month";

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

export interface PendingOrdersBreakdown {
  pending: number;
  placed: number;
  processing: number;
}

export interface MetricGrowth {
  revenuePercentage: number;
  ordersPercentage: number;
  customersPercentage: number;
}

export interface PeriodMetrics {
  period: DashboardPeriod;
  startDate: string;
  endDate: string;
  revenue: number;
  orders: number;
  newCustomers: number;
  newCustomersToday: number;
  growth: MetricGrowth;
}

export interface DashboardStatsResponse {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  pendingOrdersBreakdown: PendingOrdersBreakdown;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryAlerts: number;
  refundRequests: number;
  totalRefundRequests: number;
  periodMetrics: PeriodMetrics;
}

export interface ChartDataPoint {
  date: string;
  label: string;
  revenue: number;
  ordersCount: number;
  itemsCount: number;
  averageOrderValue: number;
}

export interface SalesChartSummary {
  totalRevenue: number;
  totalOrders: number;
  totalItems: number;
  averageOrderValue: number;
}

export interface SalesChartResponse {
  period: DashboardPeriod;
  groupBy: ChartGroupBy;
  startDate: string;
  endDate: string;
  summary: SalesChartSummary;
  chartData: ChartDataPoint[];
}

export interface OrderItemSummary {
  id: string;
  productId: string;
  productName: string;
  variantName: string | null;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface RecentOrderCustomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface OrderPaymentSummary {
  id: string;
  status: string;
  paymentMethod: string;
  amount: number;
}

export interface RecentOrderItem {
  id: string;
  orderNumber: string;
  customer: RecentOrderCustomer;
  orderStatus: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  itemsCount: number;
  itemsSummary: string;
  items: OrderItemSummary[];
  latestPayment: OrderPaymentSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecentOrdersResponse {
  total: number;
  orders: RecentOrderItem[];
}

export interface OrderStatusBreakdownItem {
  status: OrderStatus;
  label: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface OrderStatusSummaryResponse {
  totalOrders: number;
  breakdown: OrderStatusBreakdownItem[];
}

export interface TopCategoryItem {
  categoryId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  totalRevenue: number;
  totalUnitsSold: number;
  productsCount: number;
  percentageOfTotal: number;
}

export interface TopCategoriesResponse {
  period: DashboardPeriod;
  totalCategories: number;
  totalRevenue: number;
  categories: TopCategoryItem[];
}

export interface LowStockItem {
  id: string;
  type: "PRODUCT" | "VARIANT";
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  sku: string | null;
  imageUrl: string | null;
  category: string;
  price: number;
  currentStock: number;
  isOutOfStock: boolean;
  status: string;
}

export interface LowStockResponse {
  threshold: number;
  totalLowStockItems: number;
  page: number;
  limit: number;
  items: LowStockItem[];
}

export interface PaymentMethodBreakdownItem {
  method: string;
  count: number;
  totalAmount: number;
  completedCount: number;
  pendingCount: number;
  percentage: number;
}

export interface PaymentMethodSummaryResponse {
  totalOrders: number;
  totalAmount: number;
  breakdown: PaymentMethodBreakdownItem[];
}

export interface SalesTargetsData {
  monthlyRevenueTarget: number;
  monthlyOrdersTarget: number;
  currentRevenue: number;
  currentOrders: number;
  revenueProgressPercentage: number;
  ordersProgressPercentage: number;
  month: string;
  year: number;
  updatedAt?: string;
}

export interface SalesTargetsResponse {
  success: boolean;
  data: SalesTargetsData;
}

export interface UpdateSalesTargetsDto {
  monthlyRevenueTarget?: number;
  monthlyOrdersTarget?: number;
}

export interface UnifiedDashboardData {
  summary: DashboardStatsResponse;
  salesChart: SalesChartResponse;
  orderStatusSummary: OrderStatusSummaryResponse;
  topCategories: TopCategoriesResponse;
  recentOrders: RecentOrdersResponse;
  lowStockProducts: LowStockResponse;
  paymentMethodSummary: PaymentMethodSummaryResponse;
  salesTargets?: SalesTargetsData;
}

export interface UnifiedDashboardResponse {
  success: boolean;
  data: UnifiedDashboardData;
}

// Query Parameter Interfaces
export interface DashboardQueryParams {
  period?: DashboardPeriod;
  startDate?: string;
  endDate?: string;
  lowStockThreshold?: number;
  recentOrdersLimit?: number;
  topCategoriesLimit?: number;
}

export interface SalesChartQueryParams {
  period?: DashboardPeriod;
  groupBy?: ChartGroupBy;
  startDate?: string;
  endDate?: string;
}

export interface RecentOrdersQueryParams {
  limit?: number;
  status?: OrderStatus;
}

export interface TopCategoriesQueryParams {
  period?: DashboardPeriod;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface LowStockQueryParams {
  threshold?: number;
  limit?: number;
  page?: number;
}
