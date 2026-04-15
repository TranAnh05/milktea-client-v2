// src/services/orderService.ts
import axiosInstance from '@/config/axios';
import type { ApiResponse } from '@/types/auth.types';
import type { CartItemRequest } from './cartService';

export interface OrderRequest {
  customerName: string;
  phone: string;
  address: string;
  note: string;
  paymentMethod: string;
  voucherId?: number | null;
  guestItems?: CartItemRequest[] | null; // để phân biệt User/Guest
}

export interface PlaceOrderResponse {
  orderId: string,
  finalTotal: number,
  paymentMethod: string
}

export const orderService = {
  placeOrder: async (request: OrderRequest): Promise<ApiResponse<PlaceOrderResponse>> => {
    return axiosInstance.post('/orders', request);
  },

  // Lấy lịch sử
  getMyOrders: async (status: string | null, page: number = 0, size: number = 10) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (status) params.append('status', status);
    return axiosInstance.get(`/orders/my-orders?${params.toString()}`);
  },

  // Hủy đơn
  cancelOrder: async (orderId: string, reason: string) => {
    return axiosInstance.put(`/orders/${orderId}/cancel`, { reason });
  },

  // Thêm hàm lấy chi tiết đơn hàng (Dành cho User đã đăng nhập)
  getOrderDetail: async (orderId: string) => {
    return axiosInstance.get(`/orders/${orderId}`);
  },

  // Tra cứu đơn hàng cho Guest (Không cần Token)
  trackOrder: async (orderId: string, phone: string) => {
    return axiosInstance.get(`/orders/track?orderId=${orderId}&phone=${phone}`);
  },

  checkPaymentStatus: async (orderId: string) => {
    return axiosInstance.get(`/orders/${orderId}/payment-status`);
  }
};