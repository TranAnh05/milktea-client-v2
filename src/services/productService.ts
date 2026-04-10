// src/services/productService.ts
import axiosInstance from '@/config/axios';
import type { ApiResponse } from '@/types/auth.types'; 
import type { ProductDetailResponse, ProductResponse } from '@/types/product.types';

export const productService = {
  // Gọi API lấy danh sách khuyến mãi
  getPromotionalProducts: async (): Promise<ApiResponse<ProductResponse[]>> => {
    return axiosInstance.get('/products/promotional');
  },

  getProductDetail: async (slug: string): Promise<ApiResponse<ProductDetailResponse>> => {
    return axiosInstance.get(`/products/${slug}`);
  },

  getProductsByCategorySlug: async (slug: string, page: number = 0, size: number = 12) => {
    return axiosInstance.get(`/products/category/${slug}?page=${page}&size=${size}`);
  } 
};