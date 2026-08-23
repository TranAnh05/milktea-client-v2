import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Dùng useRef để ngăn chặn strict-mode của React 18 gọi API 2 lần liên tiếp
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    const verifyUserToken = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Không tìm thấy mã xác thực trong đường dẫn.');
        return;
      }

      if (hasCalledAPI.current) return;
      hasCalledAPI.current = true;

      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.response?.data?.message || 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.');
      }
    };

    verifyUserToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
        
        {/* TRẠNG THÁI 1: ĐANG XỬ LÝ */}
        {status === 'loading' && (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-6" />
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Đang xác thực...</h2>
            <p className="text-gray-500">Hệ thống đang kiểm tra thông tin của bạn.</p>
          </div>
        )}

        {/* TRẠNG THÁI 2: THÀNH CÔNG */}
        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Xác thực thành công!</h2>
            <p className="text-gray-500 mb-8">Tài khoản của bạn đã được kích hoạt. Chào mừng bạn đến với hệ thống đặt hàng.</p>
            <Link 
              to="/login" 
              className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl hover:bg-amber-600 active:scale-95 transition-all shadow-md shadow-amber-200"
            >
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {/* TRẠNG THÁI 3: THẤT BẠI */}
        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <XCircle className="w-20 h-20 text-red-500 mb-6" />
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Xác thực thất bại</h2>
            <p className="text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm w-full mb-8 font-medium border border-red-100">
              {errorMessage}
            </p>
            
            <div className="w-full flex flex-col gap-3">
              <button className="w-full bg-amber-50 text-amber-700 font-bold py-3.5 rounded-xl hover:bg-amber-100 transition-colors border border-amber-200 active:scale-95">
                Gửi lại email xác thực
              </button>
              <Link to="/" className="text-gray-500 font-medium py-2 hover:text-amber-500 transition-colors">
                Quay lại Trang chủ
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};