import React, { useState } from 'react';
import { useSearchParams, Navigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [isCopied, setIsCopied] = useState(false);

  // LOGIC BẢO VỆ: Nếu không có orderId trên URL, trục xuất về trang chủ
  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  // Hàm xử lý copy mã đơn hàng
  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setIsCopied(true);
    toast.success("Đã sao chép mã đơn hàng!");
    setTimeout(() => setIsCopied(false), 3000); // Tắt chữ "Đã copy" sau 3 giây
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
        
        {/* ICON SUCCESS */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-500 mb-8">
          Cảm ơn bạn đã tin tưởng. Đơn hàng của bạn đã được ghi nhận và đang chờ quán xác nhận để chuẩn bị.
        </p>

        {/* KHU VỰC HIỂN THỊ MÃ ĐƠN */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-8">
          <p className="text-sm font-medium text-orange-800 mb-2">Mã đơn hàng của bạn</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-bold text-orange-600 tracking-wider">
              {orderId}
            </span>
            <button 
              onClick={handleCopyOrderId}
              title="Sao chép mã"
              className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
            >
              {isCopied ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              )}
            </button>
          </div>
          <p className="text-xs text-orange-600/70 mt-3 italic">
            *Vui lòng lưu lại mã này để tra cứu tình trạng đơn hàng
          </p>
        </div>

        {/* CÁC NÚT ĐIỀU HƯỚNG */}
        <div className="space-y-3">
          <Link 
            to="/category/all"
            className="block w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 hover:shadow-lg transition-all"
          >
            TIẾP TỤC MUA SẮM
          </Link>
          
          <button 
            // Tạm thời chưa có link, sau này nối vào trang Tra cứu đơn
            onClick={() => toast("Tính năng tra cứu đơn đang được xây dựng!")}
            className="block w-full py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Theo dõi đơn hàng
          </button>
        </div>

      </div>
    </div>
  );
}