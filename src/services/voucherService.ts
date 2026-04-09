import axiosInstance from '@/config/axios';
import { type ApiResponse } from '@/types/auth.types'; 

export interface VoucherResponse {
  id: number;
  code: string;
  discountAmount: number;
  message: string;
  minOrderAmount?: number;
}

export const voucherService = {
  checkVoucher: async (code: string, orderValue: number): Promise<ApiResponse<VoucherResponse>> => {
    // Mã hóa code để an toàn khi truyền qua URL (đề phòng khách nhập ký tự lạ)
    return axiosInstance.get(`/vouchers/check?code=${encodeURIComponent(code)}&orderValue=${orderValue}`);
  },

  getActiveVouchers: async (): Promise<ApiResponse<VoucherResponse[]>> => {
    return axiosInstance.get('/vouchers/active');
  }
};