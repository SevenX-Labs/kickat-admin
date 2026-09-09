/**
 * TypeScript definitions for KickAt Admin Analytics & Business Intelligence API
 * Matching specification for /api/v1/admin/analytics endpoints
 */

export type AnalyticsGroupBy = "day" | "week" | "month";

export interface AnalyticsDateRangeParams {
  dateFrom?: string;
  dateTo?: string;
  groupBy?: AnalyticsGroupBy;
}

export interface ProductAnalyticsParams {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

// 1. Sales Performance Trends
export interface SalesTrendItem {
  date: string;
  sales?: number;
  salesAmount?: number;
  orders?: number;
  ordersCount?: number;
  units?: number;
  unitsSold?: number;
  aov?: number;
  label?: string;
}

export interface SalesAnalyticsData {
  totalSales?: number;
  totalUnitsSold?: number;
  averageOrderValue?: number;
  trends?: SalesTrendItem[];
  chartData?: SalesTrendItem[];
  summary?: {
    totalSalesAmount: number;
    totalOrders: number;
    totalUnitsSold: number;
    averageOrderValue: number;
  };
  topSalesByPaymentMethod?: Array<{
    paymentMethod: string;
    salesAmount: number;
    ordersCount: number;
    percentage: number;
  }>;
}

export interface SalesAnalyticsResponse {
  success: boolean;
  data: SalesAnalyticsData;
}

// 2. Gross & Net Revenue Analytics
export interface RevenueBreakdownItem {
  period?: string;
  date?: string;
  label?: string;
  gross?: number;
  grossRevenue?: number;
  discounts?: number;
  refunds?: number;
  net?: number;
  netRevenue?: number;
  deliveryFee?: number;
}

export interface RevenueAnalyticsData {
  grossRevenue?: number;
  discounts?: number;
  refunds?: number;
  netRevenue?: number;
  breakdown?: RevenueBreakdownItem[];
  chartData?: RevenueBreakdownItem[];
  summary?: {
    grossRevenue: number;
    netRevenue: number;
    subtotalRevenue: number;
    deliveryFeeRevenue: number;
    refundedAmount: number;
    averageRevenuePerOrder: number;
    returnRequestsCount: number;
  };
  periodComparison?: {
    currentPeriodRevenue: number;
    previousPeriodRevenue: number;
    growthRatePercentage: number;
  };
}

export interface RevenueAnalyticsResponse {
  success: boolean;
  data: RevenueAnalyticsData;
}

// 3. Order Volume & Heatmaps
export interface HourlyHeatmapItem {
  hour: number;
  ordersCount: number;
}

export interface OrderAnalyticsData {
  totalOrders?: number;
  completionRate?: number;
  cancellationRate?: number;
  hourlyHeatmap?: HourlyHeatmapItem[];
  summary?: {
    totalOrders: number;
    completedOrdersCount?: number;
    deliveredCount?: number;
    shippedCount?: number;
    processingCount?: number;
    cancelledCount?: number;
    returnedCount?: number;
    pendingOrdersCount?: number;
    completionRatePercentage?: number;
    fulfillmentRatePercentage?: number;
    cancellationRatePercentage?: number;
    returnRatePercentage?: number;
  };
}

export interface OrderAnalyticsResponse {
  success: boolean;
  data: OrderAnalyticsData;
}

// 4. Customer Acquisition & Cohort Retention
export interface TopSpenderItem {
  id: string;
  name: string;
  email: string | null;
  totalOrders?: number;
  ordersCount?: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export interface CustomerAnalyticsData {
  newCustomers?: number;
  repeatCustomerRate?: number;
  topSpenders?: TopSpenderItem[];
  topCustomersBySpend?: TopSpenderItem[];
  summary?: {
    totalCustomersInSystem: number;
    newCustomersInPeriod: number;
    activeCustomersInPeriod: number;
    repeatCustomersCount: number;
    customerRetentionRatePercentage: number;
    averageCustomerSpend: number;
  };
  segmentation?: {
    newCustomers: number;
    repeatCustomers: number;
    oneTimeCustomers: number;
  };
}

export interface CustomerAnalyticsResponse {
  success: boolean;
  data: CustomerAnalyticsData;
}

// 5. Product Performance & Inventory Health
export interface TopProductItem {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
  categoryName?: string;
  unitsSold: number;
  revenue?: number;
  revenueGenerated?: number;
  currentStock?: number;
}

export interface InventoryHealthData {
  healthyStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface ProductAnalyticsData {
  topProducts?: TopProductItem[];
  topSellingProducts?: TopProductItem[];
  inventoryHealth?: InventoryHealthData;
  summary?: {
    totalActiveProducts: number;
    outOfStockCount: number;
    lowStockCount: number;
    totalUnitsSoldInPeriod: number;
    totalRevenueInPeriod: number;
    topPerformingProduct: string | null;
  };
  topSellingCategories?: Array<{
    id: string;
    name: string;
    unitsSold: number;
    revenue: number;
    percentage: number;
  }>;
  lowStockAlerts?: Array<{
    id: string;
    name: string;
    slug: string;
    stock: number;
    categoryName: string;
    status: string;
  }>;
}

export interface ProductAnalyticsResponse {
  success: boolean;
  data: ProductAnalyticsData;
}

// Unified Combined Analytics State for the Analytics Page
export interface CombinedAnalyticsState {
  sales: SalesAnalyticsData | null;
  revenue: RevenueAnalyticsData | null;
  orders: OrderAnalyticsData | null;
  customers: CustomerAnalyticsData | null;
  products: ProductAnalyticsData | null;
}
