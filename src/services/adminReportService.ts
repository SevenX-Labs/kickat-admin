import api from './api';

export interface ReportDateRange {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface ReportSummaryResponse<T> {
  success: boolean;
  data: {
    dateRange: { from: string; to: string };
    summary: any;
    records: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export const AdminReportService = {
  getSalesReport: async (params?: ReportDateRange) => {
    const response = await api.get<ReportSummaryResponse<any>>('/admin/reports/sales', { params });
    return response.data;
  },

  exportSalesReport: async (format: 'CSV' | 'JSON' | 'PDF', params?: ReportDateRange) => {
    const response = await api.get('/admin/reports/sales/export', {
      params: { ...params, format },
      responseType: 'blob', // Important for file downloads
    });
    return response.data;
  },

  getOrdersReport: async (params?: ReportDateRange & { status?: string }) => {
    const response = await api.get<ReportSummaryResponse<any>>('/admin/reports/orders', { params });
    return response.data;
  },

  getCustomersReport: async (params?: ReportDateRange) => {
    const response = await api.get<ReportSummaryResponse<any>>('/admin/reports/customers', { params });
    return response.data;
  },

  getProductsReport: async (params?: ReportDateRange & { categoryId?: string }) => {
    const response = await api.get<ReportSummaryResponse<any>>('/admin/reports/products', { params });
    return response.data;
  },

  getRefundsReport: async (params?: ReportDateRange) => {
    const response = await api.get<ReportSummaryResponse<any>>('/admin/reports/refunds', { params });
    return response.data;
  },

  getGstReport: async (params?: ReportDateRange) => {
    const response = await api.get<ReportSummaryResponse<any>>('/admin/reports/gst', { params });
    return response.data;
  }
};
