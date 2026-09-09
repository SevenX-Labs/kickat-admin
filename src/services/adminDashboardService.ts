// services/adminDashboardService.ts
import { AxiosError } from "axios";
import apiClient from "./api";
import {
  DashboardQueryParams,
  SalesChartQueryParams,
  RecentOrdersQueryParams,
  TopCategoriesQueryParams,
  LowStockQueryParams,
  UnifiedDashboardResponse,
  DashboardStatsResponse,
  SalesChartResponse,
  RecentOrdersResponse,
  OrderStatusSummaryResponse,
  TopCategoriesResponse,
  LowStockResponse,
} from "@/types/admin-dashboard";

export const AdminDashboardService = {
  /**
   * 1. Get Unified Dashboard Summary (Consolidated for fast initial load)
   * GET /api/v1/admin/dashboard
   * Includes resilient fallback to individual endpoints if the combined endpoint
   * experiences upstream timeouts or database connection limit delays.
   */
  async getUnifiedDashboard(
    params?: DashboardQueryParams
  ): Promise<UnifiedDashboardResponse> {
    try {
      const res = await apiClient.get<UnifiedDashboardResponse>("/admin/dashboard", {
        params,
      });
      if (res.data?.success && res.data.data) {
        return res.data;
      }
    } catch (err) {
      console.warn(
        "Direct /admin/dashboard endpoint unavailable or timed out, synthesizing from granular endpoints:",
        err
      );
    }

    // Parallel resilient fallback: query individual endpoints concurrently
    const [
      statsRes,
      salesChartRes,
      ordersSummaryRes,
      topCatsRes,
      recentOrdersRes,
      lowStockRes,
    ] = await Promise.allSettled([
      this.getStats(params),
      this.getSalesChart({
        period: params?.period,
        startDate: params?.startDate,
        endDate: params?.endDate,
      }),
      this.getOrderStatusSummary(),
      this.getTopCategories({
        period: params?.period,
        limit: params?.topCategoriesLimit ?? 5,
        startDate: params?.startDate,
        endDate: params?.endDate,
      }),
      this.getRecentOrders({ limit: params?.recentOrdersLimit ?? 10 }),
      this.getLowStock({
        threshold: params?.lowStockThreshold ?? 10,
        limit: 10,
      }),
    ]);

    const salesChart: SalesChartResponse =
      salesChartRes.status === "fulfilled"
        ? salesChartRes.value
        : {
            period: params?.period || "7d",
            groupBy: "day",
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            summary: {
              totalRevenue: 0,
              totalOrders: 0,
              totalItems: 0,
              averageOrderValue: 0,
            },
            chartData: [],
          };

    const orderStatusSummary: OrderStatusSummaryResponse =
      ordersSummaryRes.status === "fulfilled"
        ? ordersSummaryRes.value
        : {
            totalOrders: 0,
            breakdown: [],
          };

    const topCategories: TopCategoriesResponse =
      topCatsRes.status === "fulfilled"
        ? topCatsRes.value
        : {
            period: params?.period || "7d",
            totalCategories: 0,
            totalRevenue: 0,
            categories: [],
          };

    const recentOrders: RecentOrdersResponse =
      recentOrdersRes.status === "fulfilled"
        ? recentOrdersRes.value
        : {
            total: 0,
            orders: [],
          };

    const lowStockProducts: LowStockResponse =
      lowStockRes.status === "fulfilled"
        ? lowStockRes.value
        : {
            threshold: params?.lowStockThreshold ?? 10,
            totalLowStockItems: 0,
            page: 1,
            limit: 10,
            items: [],
          };

    let summary: DashboardStatsResponse;
    if (statsRes.status === "fulfilled") {
      summary = statsRes.value;
    } else {
      const totalRev =
        orderStatusSummary.breakdown.reduce(
          (acc, curr) => acc + (curr.revenue ?? 0),
          0
        ) || (salesChart.summary.totalRevenue ?? 0);

      const pendingOrdersCount =
        orderStatusSummary.breakdown
          .filter((b) => ["PENDING", "PLACED", "PROCESSING"].includes(b.status))
          .reduce((acc, curr) => acc + (curr.count ?? 0), 0);

      summary = {
        totalRevenue: totalRev,
        totalOrders: orderStatusSummary.totalOrders ?? 0,
        totalCustomers: 1,
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: pendingOrdersCount,
        pendingOrdersBreakdown: {
          pending:
            orderStatusSummary.breakdown.find((b) => b.status === "PENDING")
              ?.count ?? 0,
          placed:
            orderStatusSummary.breakdown.find((b) => b.status === "PLACED")
              ?.count ?? 0,
          processing:
            orderStatusSummary.breakdown.find((b) => b.status === "PROCESSING")
              ?.count ?? 0,
        },
        lowStockProducts: lowStockProducts.items.filter((i) => !i.isOutOfStock)
          .length,
        outOfStockProducts: lowStockProducts.items.filter((i) => i.isOutOfStock)
          .length,
        totalInventoryAlerts: lowStockProducts.totalLowStockItems ?? 0,
        refundRequests:
          orderStatusSummary.breakdown.find(
            (b) => b.status === "RETURN_INITIATED"
          )?.count ?? 0,
        totalRefundRequests:
          (orderStatusSummary.breakdown.find(
            (b) => b.status === "RETURN_INITIATED"
          )?.count ?? 0) +
          (orderStatusSummary.breakdown.find((b) => b.status === "RETURNED")
            ?.count ?? 0),
        periodMetrics: {
          period: params?.period || "7d",
          startDate: salesChart.startDate,
          endDate: salesChart.endDate,
          revenue: salesChart.summary.totalRevenue ?? totalRev,
          orders:
            salesChart.summary.totalOrders ??
            orderStatusSummary.totalOrders ??
            0,
          newCustomers: 0,
          newCustomersToday: 0,
          growth: {
            revenuePercentage: 0,
            ordersPercentage: 0,
            customersPercentage: 0,
          },
        },
      };
    }

    return {
      success: true,
      data: {
        summary,
        salesChart,
        orderStatusSummary,
        topCategories,
        recentOrders,
        lowStockProducts,
        paymentMethodSummary: {
          totalOrders: orderStatusSummary.totalOrders ?? 0,
          totalAmount: summary.totalRevenue ?? 0,
          breakdown: [],
        },
      },
    };
  },

  /**
   * 2. Get High-Level KPI Summary & Growth Stats
   * GET /api/v1/admin/dashboard/stats
   */
  async getStats(
    params?: DashboardQueryParams
  ): Promise<DashboardStatsResponse> {
    const res = await apiClient.get<DashboardStatsResponse>(
      "/admin/dashboard/stats",
      { params }
    );
    return res.data;
  },

  /**
   * 3. Get Time-Series Sales Chart Data
   * GET /api/v1/admin/dashboard/sales-chart
   */
  async getSalesChart(
    params?: SalesChartQueryParams
  ): Promise<SalesChartResponse> {
    const res = await apiClient.get<SalesChartResponse>(
      "/admin/dashboard/sales-chart",
      { params }
    );
    return res.data;
  },

  /**
   * 4. Get Stream of Recent Orders
   * GET /api/v1/admin/dashboard/recent-orders
   */
  async getRecentOrders(
    params?: RecentOrdersQueryParams
  ): Promise<RecentOrdersResponse> {
    const res = await apiClient.get<RecentOrdersResponse>(
      "/admin/dashboard/recent-orders",
      { params }
    );
    return res.data;
  },

  /**
   * 5. Get Order Status Lifecycle Breakdown
   * GET /api/v1/admin/dashboard/order-status-summary
   */
  async getOrderStatusSummary(): Promise<OrderStatusSummaryResponse> {
    const res = await apiClient.get<OrderStatusSummaryResponse>(
      "/admin/dashboard/order-status-summary"
    );
    return res.data;
  },

  /**
   * 6. Get Top-Selling Categories
   * GET /api/v1/admin/dashboard/top-categories
   */
  async getTopCategories(
    params?: TopCategoriesQueryParams
  ): Promise<TopCategoriesResponse> {
    const res = await apiClient.get<TopCategoriesResponse>(
      "/admin/dashboard/top-categories",
      { params }
    );
    return res.data;
  },

  /**
   * 7. Get Low-Stock & Out-of-Stock Warnings
   * GET /api/v1/admin/dashboard/low-stock
   */
  async getLowStock(
    params?: LowStockQueryParams
  ): Promise<LowStockResponse> {
    const res = await apiClient.get<LowStockResponse>(
      "/admin/dashboard/low-stock",
      { params }
    );
    return res.data;
  },

  /**
   * Safe helper to extract formatted error messages from API responses
   */
  extractErrorMessage(
    err: unknown,
    fallback = "An unexpected error occurred."
  ): string {
    if (err && typeof err === "object" && "response" in err) {
      const axiosErr = err as AxiosError<any>;
      const respData = axiosErr.response?.data;
      if (respData) {
        if (Array.isArray(respData.errors) && respData.errors.length > 0) {
          return respData.errors.join(", ");
        }
        if (respData.message) {
          return typeof respData.message === "string"
            ? respData.message
            : JSON.stringify(respData.message);
        }
      }
    }
    if (err instanceof Error && err.message) {
      return err.message;
    }
    return fallback;
  },
};

export default AdminDashboardService;
