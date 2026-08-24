/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { authService } from '@/services/authService';
import type { LoginRequest } from '@/types/auth.types';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth } from '@/redux/slices/authSlice';

// 1. Định nghĩa luật Validate (Schema)
const schema = yup.object().shape({
  email: yup
    .string()
    .required('Email không được để trống')
    .email('Email không đúng định dạng'),
  password: yup
    .string()
    .required('Mật khẩu không được để trống')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Khởi tạo Form
  const {
    register,     // Hàm để gắn vào thẻ <input>
    handleSubmit, // Hàm bọc quanh sự kiện onSubmit
    formState: { errors }, // Lấy ra các lỗi để hiển thị
  } = useForm<LoginRequest>({
    resolver: yupResolver(schema),
  });

  // 4. Hàm xử lý khi người dùng bấm Submit và đã qua được vòng Validate
  const onSubmit = async (data: LoginRequest) => {
    setIsSubmitting(true);
    try {
      const response = await authService.login(data);
      dispatch(setAuth({ user: response.data.user, token: response.data.token }));
      toast.success(response.message || 'Đăng nhập thành công!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Phần Header của Form */}
        <div className="bg-amber-500 p-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-2">Đăng Nhập</h2>
          <p className="text-amber-100 text-sm">
            Mừng bạn quay lại với Trà Sữa Gia Định!
          </p>
        </div>

        {/* Phần Nhập liệu */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email của bạn</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all`}
                  placeholder="email@gmail.com"
                />
              </div>
              {/* Hiển thị lỗi nếu có */}
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Input Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'
                  } rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.password.message}</p>
              )}
              
              <div className="mt-2 flex justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-amber-600 hover:text-amber-500 transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            {/* Nút Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 px-4 rounded-xl font-bold hover:bg-amber-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đăng Nhập <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Điều hướng sang Đăng ký */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Bạn chưa có tài khoản?{' '}
              <Link to="/register" className="font-bold text-amber-600 hover:text-amber-500 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};