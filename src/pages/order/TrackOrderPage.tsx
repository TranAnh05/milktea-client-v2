/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { orderService } from '@/services/orderService';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  PREPARING: { label: 'Đang pha chế', color: 'bg-blue-100 text-blue-800' },
  DELIVERING: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null); 

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại.");
      return;
    }

    setIsLoading(true);
    try {
      // Auto viết hoa mã đơn hàng để chống lỗi gõ chữ thường
      const formattedOrderId = orderId.trim().toUpperCase();
      const res = await orderService.trackOrder(formattedOrderId, phone.trim());
      
      if (res.data) {
        setOrderResult(res.data);
        toast.success("Tra cứu thành công!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Mã đơn hàng hoặc số điện thoại không đúng.");
      setOrderResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetTracking = () => {
    setOrderResult(null);
    setOrderId('');
    setPhone('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* TRẠNG THÁI 1: FORM TRA CỨU (Chỉ hiện khi chưa có kết quả) */}
      {!orderResult && (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-orange-500 p-6 text-center">
            <svg className="w-12 h-12 text-white mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            <h2 className="text-2xl font-bold text-white">Tra cứu đơn hàng</h2>
            <p className="text-orange-100 text-sm mt-1">Kiểm tra tình trạng đơn trà sữa của bạn</p>
          </div>
          
          <form onSubmit={handleTrackOrder} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã đơn hàng *</label>
              <input
                type="text"
                placeholder="VD: ORD-123456789"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none uppercase transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại đặt hàng *</label>
              <input
                type="tel"
                placeholder="VD: 0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-bold text-white transition-colors flex justify-center items-center gap-2
                ${isLoading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg'}`}
            >
              {isLoading ? 'Đang tìm kiếm...' : 'Tra cứu ngay'}
            </button>
          </form>
        </div>
      )}

      {/* TRẠNG THÁI 2: HIỂN THỊ KẾT QUẢ HÓA ĐƠN */}
      {orderResult && (
        <div className="max-w-3xl mx-auto">
          {/* Nút quay lại tra cứu đơn khác */}
          <button 
            onClick={resetTracking}
            className="mb-6 flex items-center text-gray-500 hover:text-orange-500 font-medium transition-colors bg-white px-4 py-2 rounded-lg shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Tra cứu đơn khác
          </button>

          {/* Dùng lại cấu trúc UI của OrderDetailPage */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Mã đơn hàng</p>
                <p className="text-xl font-extrabold text-orange-600 tracking-tight">{orderResult.orderId}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(orderResult.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${STATUS_CONFIG[orderResult.orderStatus]?.color || STATUS_CONFIG.PENDING.color}`}>
                  {STATUS_CONFIG[orderResult.orderStatus]?.label || STATUS_CONFIG.PENDING.label}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Thông tin giao hàng */}
              <div className="bg-gray-50/50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm text-gray-700 border border-gray-100">
                <div>
                  <p className="mb-2"><span className="text-gray-500 mr-1 inline-block">Người nhận:</span><span className="font-semibold">{orderResult.guestName}</span></p>
                  <p><span className="text-gray-500 mr-1 inline-block">Điện thoại:</span><span className="font-semibold">{orderResult.guestPhone}</span></p>
                </div>
                <div>
                  <p className="mb-2"><span className="text-gray-500 mr-1 inline-block">Địa chỉ:</span><span className="font-semibold">{orderResult.guestAddress}</span></p>
                  {orderResult.note && <p><span className="text-gray-500 mr-1 inline-block">Ghi chú:</span><span className="font-medium text-orange-600">"{orderResult.note}"</span></p>}
                </div>
              </div>

              {/* Danh sách món ăn */}
              <h3 className="text-base font-bold text-gray-800 mb-4 border-b pb-2 uppercase">Sản phẩm đã đặt</h3>
              <div className="space-y-4 mb-8">
                {orderResult.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 items-start border-b border-dashed pb-4 last:border-0 last:pb-0">
                    <img src={item.productImage || '/placeholder.png'} alt={item.productName} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-base">{item.productName}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded">
                        Size {item.sizeName} • {item.sugarLevel} Đường • {item.iceLevel} Đá
                      </p>
                      {item.toppings?.length > 0 && (
                        <ul className="mt-1 text-xs text-gray-500">
                          {item.toppings.map((t: any) => <li key={t.id}>+ {t.toppingName}</li>)}
                        </ul>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{item.unitPrice.toLocaleString('vi-VN')}đ</p>
                      <p className="text-xs text-gray-500 my-1">x <span className="font-bold">{item.quantity}</span></p>
                      <p className="font-bold text-orange-600 mt-1">{item.totalPrice.toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tóm tắt thanh toán */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5 text-sm">
                <div className="flex justify-between items-center border-t border-dashed border-gray-300 pt-3 mt-2">
                  <span className="text-base font-bold text-gray-800">Tổng thanh toán</span>
                  <span className="text-2xl font-extrabold text-orange-600">{orderResult.finalTotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="pt-2 flex justify-between items-center text-xs text-gray-500">
                  <span>Phương thức: <strong className="text-gray-700">{orderResult.paymentMethod === "COD" ? "Tiền mặt" : "Chuyển khoản ngân hàng"}</strong></span>
                  <span className={`px-2 py-1 rounded font-medium ${orderResult.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {orderResult.paymentStatus === 'PAID' ? '✓ Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}

    </div>
  );
}