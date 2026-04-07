// src/services/productService.ts
import axiosInstance from '@/config/axios';
import type { ApiResponse } from '@/types/auth.types'; 
import type { ProductResponse } from '@/types/product.types';

export const productService = {
  // Gọi API lấy danh sách khuyến mãi
  getPromotionalProducts: async (): Promise<ApiResponse<ProductResponse[]>> => {
    return axiosInstance.get('/products/promotional');
  },
};