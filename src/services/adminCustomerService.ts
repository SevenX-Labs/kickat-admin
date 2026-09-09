import { AxiosError } from "axios";
import { apiClient } from "./api";
import {
  AdminCustomersResponse,
  SingleCustomerResponse,
  CustomerOrdersResponse,
  CustomerAddressesResponse,
  CustomerPetsResponse,
  UpdateCustomerStatusResponse,
  AdminCustomersQueryParams,
  CustomerOrdersQueryParams,
  AdminCustomerDetail,
  CustomerAddressItem,
  CustomerPetItem,
} from "../types/admin-customer";

export const AdminCustomerService = {
  /**
   * 1. List Customers (Search, Filter, Sort, Paginate)
   * GET /api/v1/admin/customers
   */
  async getCustomers(params?: AdminCustomersQueryParams): Promise<AdminCustomersResponse> {
    const res = await apiClient.get<AdminCustomersResponse>("/admin/customers", {
      params,
    });
    return res.data;
  },

  /**
   * 2. Get Complete Customer Profile with Lifetime Stats
   * GET /api/v1/admin/customers/:id
   */
  async getCustomerById(id: string): Promise<AdminCustomerDetail> {
    const res = await apiClient.get<SingleCustomerResponse>(
      `/admin/customers/${encodeURIComponent(id)}`
    );
    return res.data.data;
  },

  /**
   * 3. Customer Order History
   * GET /api/v1/admin/customers/:id/orders
   */
  async getCustomerOrders(
    id: string,
    params?: CustomerOrdersQueryParams
  ): Promise<CustomerOrdersResponse["data"]> {
    const res = await apiClient.get<CustomerOrdersResponse>(
      `/admin/customers/${encodeURIComponent(id)}/orders`,
      { params }
    );
    return res.data.data;
  },

  /**
   * 4. Customer Saved Addresses
   * GET /api/v1/admin/customers/:id/addresses
   */
  async getCustomerAddresses(id: string): Promise<CustomerAddressItem[]> {
    const res = await apiClient.get<CustomerAddressesResponse>(
      `/admin/customers/${encodeURIComponent(id)}/addresses`
    );
    return res.data.data.addresses;
  },

  /**
   * 5. Customer Registered Pet Profiles
   * GET /api/v1/admin/customers/:id/pets
   */
  async getCustomerPets(id: string): Promise<CustomerPetItem[]> {
    const res = await apiClient.get<CustomerPetsResponse>(
      `/admin/customers/${encodeURIComponent(id)}/pets`
    );
    return res.data.data.pets;
  },

  /**
   * 6. Block or Unblock Customer Account (Instant Session Revocation)
   * PATCH /api/v1/admin/customers/:id/status
   */
  async updateCustomerStatus(
    id: string,
    isBlocked: boolean,
    reason?: string
  ): Promise<UpdateCustomerStatusResponse> {
    const res = await apiClient.patch<UpdateCustomerStatusResponse>(
      `/admin/customers/${encodeURIComponent(id)}/status`,
      { isBlocked, reason }
    );
    return res.data;
  },

  /**
   * Helper: Extract human-readable error from Axios response
   */
  extractErrorMessage(err: unknown, fallback = "An unexpected error occurred."): string {
    if (err && typeof err === "object" && "response" in err) {
      const axiosErr = err as AxiosError<{ message?: string | string[]; error?: string }>;
      const msg = axiosErr.response?.data?.message;
      if (typeof msg === "string") return msg;
      if (Array.isArray(msg) && msg.length > 0) return msg.join(", ");
      if (axiosErr.response?.data?.error) return axiosErr.response.data.error;
    }
    if (err instanceof Error) return err.message;
    return fallback;
  },
};

export default AdminCustomerService;
