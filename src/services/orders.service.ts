import { AdminOrderService } from "./adminOrderService";
import {
  AdminOrdersQuery,
  UpdateOrderStatusDto,
  AdminCancelOrderDto,
  AdminRefundOrderDto,
} from "@/types/admin-order";

export const ordersService = {
  list: (params?: AdminOrdersQuery) => AdminOrderService.getOrders(params),
  getById: (id: string) => AdminOrderService.getOrderById(id),
  updateStatus: (id: string, payload: UpdateOrderStatusDto) =>
    AdminOrderService.updateStatus(id, payload),
  cancel: (id: string, payload: AdminCancelOrderDto) =>
    AdminOrderService.cancelOrder(id, payload),
  processRefund: (id: string, payload: AdminRefundOrderDto) =>
    AdminOrderService.processRefund(id, payload),
  getInvoice: (id: string) => AdminOrderService.getInvoice(id),
  getPackingSlip: (id: string) => AdminOrderService.getPackingSlip(id),
};

export default ordersService;
