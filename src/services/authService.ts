// src/services/authService.ts
import axiosInstance from '@/config/axios';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';

export const authService = {
  // Gọi API Đăng nhập
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return axiosInstance.post('/auth/login', data);
  },

  // Gọi API Đăng ký
  register: async (data: RegisterRequest): Promise<ApiResponse<void>> => {
    return axiosInstance.post('/auth/register', data);
  },
};