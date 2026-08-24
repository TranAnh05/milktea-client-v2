/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, Loader2, UserPlus, User, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/authService';
import type { RegisterRequest } from '@/types/auth.types';

// Mở rộng interface để phục vụ riêng cho UI (Thêm trường confirmPassword)
interface RegisterForm extends RegisterRequest {
  confirmPassword: string;
}

// 1. Regex kiểm tra số điện thoại chuẩn nhà mạng Việt Nam
const phoneRegExp = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

// 2. Định nghĩa luật Validate 
const schema = yup.object().shape({
  fullName: yup.string().required('Họ tên không được để trống'),
  email: yup.string().required('Email không được để trống').email('Email không đúng định dạng'),
  phone: yup.string()
    .required('Số điện thoại không được để trống')
    .matches(phoneRegExp, 'Số điện thoại không hợp lệ (VD: 0901234567)'),
  password: yup.string().required('Mật khẩu không được để trống').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: yup.string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp!'), 
});

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterForm) => {
    // Loại bỏ trường confirmPassword trước khi gửi xuống Backend (vì API không cần trường này)
    const { confirmPassword, ...apiData } = data;
    
    setIsSubmitting(true);
    try {
      await authService.register(apiData);
      toast.success('Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác thực.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-amber-500 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 pattern-dots opacity-20"></div>
          <h2 className="text-3xl font-extrabold text-white mb-2 relative z-10">Tạo Tài Khoản</h2>
          <p className="text-amber-100 text-sm relative z-10">
            Trở thành thành viên để nhận ngay vô vàn ưu đãi!
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Chia 2 cột cho Desktop: Họ tên & Số điện thoại */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    {...register('fullName')}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all`}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                {errors.fullName && <p className="mt-1 text-sm text-red-600 font-medium">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={20} />
                  </div>
                  <input
                    type="tel"
                    {...register('phone')}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all`}
                    placeholder="0901234567"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600 font-medium">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Cột full: Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email (Tài khoản đăng nhập)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all`}
                  placeholder="email@gmail.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600 font-medium">{errors.email.message}</p>}
            </div>

            {/* Chia 2 cột cho Desktop: Mật khẩu & Xác nhận Mật khẩu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    {...register('password')}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600 font-medium">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-amber-500'} rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 font-medium">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Nút Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 px-4 rounded-xl font-bold hover:bg-amber-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang thiết lập...
                </>
              ) : (
                <>
                  <UserPlus size={20} /> Đăng Ký
                </>
              )}
            </button>
          </form>

          {/* Điều hướng về Đăng nhập */}
          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-600 text-sm">
              Bạn đã có tài khoản?{' '}
              <Link to="/login" className="font-bold text-amber-600 hover:text-amber-500 transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};