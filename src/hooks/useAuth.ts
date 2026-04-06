/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useAuth.ts
import { useContext, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { type LoginRequest, type RegisterRequest } from '@/types/auth.types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái loading của nút Submit

  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }

  const { saveAuthInfo, logout: contextLogout } = context;

  // 1. Logic Đăng nhập
  const login = async (data: LoginRequest) => {
    setIsSubmitting(true);
    try {
      const response = await authService.login(data);
      // Lưu token và user vào Context + LocalStorage
      saveAuthInfo(response.data.user, response.data.token);
      toast.success(response.message || 'Đăng nhập thành công!');
      // Chuyển hướng về trang chủ
      navigate('/'); 
    } catch (error: any) {
      // Bắt lỗi từ Interceptor văng ra (ví dụ: Sai mật khẩu)
      toast.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Logic Đăng ký
  const register = async (data: RegisterRequest) => {
    setIsSubmitting(true);
    try {
      const response = await authService.register(data);
      toast.success(response.message || 'Đăng ký thành công! Vui lòng kiểm tra email.');
      // Chuyển hướng về trang đăng nhập
      navigate('/login'); 
    } catch (error: any) {
      toast.error(error.message || 'Đăng ký thất bại!');
      throw error; // Ném lỗi ra ngoài để component hứng (nếu muốn tô đỏ ô input)
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Logic Đăng xuất
  const logout = () => {
    contextLogout();
    toast.success('Đã đăng xuất!');
    navigate('/login');
  };

  return {
    ...context, // Trả ra user, isAuthenticated, isLoading
    login,
    register,
    logout,
    isSubmitting, // Dùng để disable nút Submit tránh user bấm 2 lần
  };
};