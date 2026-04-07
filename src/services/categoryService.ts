import axiosInstance from '@/config/axios';
import type { ApiResponse } from '@/types/auth.types';
import type { CategoryResponse } from '@/types/category.types';

export const categoryService = {
  getActiveCategories: async (): Promise<ApiResponse<CategoryResponse[]>> => {
    return axiosInstance.get('/categories');
  },
};