import apiClient from "./api";
import {
  AnalyticsDateRangeParams,
  ProductAnalyticsParams,
  SalesAnalyticsResponse,
  RevenueAnalyticsResponse,
  OrderAnalyticsResponse,
  CustomerAnalyticsResponse,
  ProductAnalyticsResponse,
  CombinedAnalyticsState,
} from "@/types/admin-analytics";

export const AdminAnalyticsService = {
  /**
   * 1. Sales Performance Trends
   * Time-series sales trends, total units sold, and Average Order Value (AOV)
   */
  async getSalesAnalytics(params?: AnalyticsDateRangeParams): Promise<SalesAnalyticsResponse> {
    const res = await apiClient.get<SalesAnalyticsResponse>("/admin/analytics/sales", {
      params,
    });
    return res.data;
  },

  /**
   * 2. Gross & Net Revenue Analytics
   * Gross revenue, discounts, refunds, net revenue, and growth comparisons
   */
  async getRevenueAnalytics(params?: AnalyticsDateRangeParams): Promise<RevenueAnalyticsResponse> {
    const res = await apiClient.get<RevenueAnalyticsResponse>("/admin/analytics/revenue", {
      params,
    });
    return res.data;
  },

  /**
   * 3. Order Volume & Heatmaps
   * Order volume trends, status breakdown, and peak ordering time heatmaps
   */
  async getOrderAnalytics(params?: AnalyticsDateRangeParams): Promise<OrderAnalyticsResponse> {
    const res = await apiClient.get<OrderAnalyticsResponse>("/admin/analytics/orders", {
      params,
    });
    return res.data;
  },

  /**
   * 4. Customer Acquisition & Cohort Retention
   * Customer acquisition, repeat buyer rates, and top store spenders
   */
  async getCustomerAnalytics(params?: AnalyticsDateRangeParams): Promise<CustomerAnalyticsResponse> {
    const res = await apiClient.get<CustomerAnalyticsResponse>("/admin/analytics/customers", {
      params,
    });
    return res.data;
  },

  /**
   * 5. Product Performance & Inventory Health
   * Top products by revenue, category velocity, and inventory health
   */
  async getProductAnalytics(params?: ProductAnalyticsParams): Promise<ProductAnalyticsResponse> {
    const res = await apiClient.get<ProductAnalyticsResponse>("/admin/analytics/products", {
      params,
    });
    return res.data;
  },

  /**
   * Fetch all 5 analytics metrics concurrently with resilient Promise.allSettled
   * Ensures the page loads smoothly even if a specific dataset is still collecting telemetry.
   */
  async getAllAnalytics(
    dateRange?: AnalyticsDateRangeParams,
    productParams?: ProductAnalyticsParams
  ): Promise<CombinedAnalyticsState> {
    const [salesRes, revenueRes, ordersRes, customersRes, productsRes] = await Promise.allSettled([
      this.getSalesAnalytics(dateRange),
      this.getRevenueAnalytics(dateRange),
      this.getOrderAnalytics(dateRange),
      this.getCustomerAnalytics(dateRange),
      this.getProductAnalytics({ ...dateRange, ...productParams }),
    ]);

    return {
      sales: salesRes.status === "fulfilled" ? salesRes.value.data : null,
      revenue: revenueRes.status === "fulfilled" ? revenueRes.value.data : null,
      orders: ordersRes.status === "fulfilled" ? ordersRes.value.data : null,
      customers: customersRes.status === "fulfilled" ? customersRes.value.data : null,
      products: productsRes.status === "fulfilled" ? productsRes.value.data : null,
    };
  },
};

export default AdminAnalyticsService;
