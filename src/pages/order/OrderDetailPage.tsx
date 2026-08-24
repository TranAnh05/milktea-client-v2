/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '@/services/orderService';
import toast from 'react-hot-toast';

// Config trạng thái màu sắc cho Đơn hàng
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  PREPARING: { label: 'Đang pha chế', color: 'bg-blue-100 text-blue-800' },
  DELIVERING: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API lấy dữ liệu khi trang vừa render
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) return;
      try {
        const res = await orderService.getOrderDetail(orderId);
        if (res.data) setOrder(res.data);
      } catch (error) {
        toast.error("Không thể tải chi tiết đơn hàng hoặc bạn không có quyền xem.");
        navigate('/account/orders'); // Lỗi/Không có quyền thì đá về danh sách
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetail();
  }, [orderId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) return null;

  const statusConfig = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
      {/* --- THANH ĐIỀU HƯỚNG QUAY LẠI --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/account/orders" className="text-gray-500 hover:text-orange-500 transition-colors bg-white p-2 rounded-full shadow-sm border border-gray-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Chi tiết hóa đơn</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* --- HEADER HÓA ĐƠN --- */}
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Mã đơn hàng</p>
            <p className="text-xl font-extrabold text-orange-600 tracking-tight">{order.orderId}</p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(order.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* --- NẾU ĐƠN BỊ HỦY THÌ HIỆN LÝ DO LÊN TRÊN CÙNG --- */}
        {order.orderStatus === 'CANCELLED' && order.cancelReason && (
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <p className="text-sm text-red-800"><strong>Lý do hủy:</strong> {order.cancelReason}</p>
          </div>
        )}

        <div className="p-6">
          {/* --- THÔNG TIN GIAO HÀNG --- */}
          <h3 className="text-base font-bold text-gray-800 mb-4 border-b pb-2 uppercase">Thông tin giao hàng</h3>
          <div className="bg-gray-50/50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm text-gray-700">
            <div>
              <p className="mb-2"><span className="text-gray-500 mr-1 inline-block">Người nhận:</span> <span className="font-semibold">{order.guestName}</span></p>
              <p><span className="text-gray-500 mr-1 inline-block">Điện thoại:</span> <span className="font-semibold">{order.guestPhone}</span></p>
            </div>
            <div>
              <p className="mb-2"><span className="text-gray-500 mr-1 inline-block">Địa chỉ:</span> <span className="font-semibold">{order.guestAddress}</span></p>
              {order.note && <p><span className="text-gray-500 mr-1 inline-block">Ghi chú:</span> <span className="font-medium text-orange-600 italic">"{order.note}"</span></p>}
            </div>
          </div>

          {/* --- DANH SÁCH MÓN ĂN --- */}
          <h3 className="text-base font-bold text-gray-800 mb-4 border-b pb-2 uppercase">Sản phẩm đã đặt</h3>
          <div className="space-y-4 mb-8">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                <img src={item.productImage || '/placeholder.png'} alt={item.productName} className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-base">{item.productName}</h4>
                  <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded">
                    Size {item.sizeName} • {item.sugarLevel} Đường • {item.iceLevel} Đá
                  </p>
                  
                  {/* Topping */}
                  {item.toppings && item.toppings.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-gray-500">
                      {item.toppings.map((t: any) => (
                        <li key={t.id} className="flex justify-between w-48">
                          <span>+ {t.toppingName}</span>
                          {t.toppingPrice > 0 && <span>{t.toppingPrice.toLocaleString('vi-VN')}đ</span>}
                        </li>
                      ))}
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

          {/* --- TÓM TẮT THANH TOÁN THỰC TẾ --- */}
          <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính ({order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} sản phẩm)</span>
              <span>{order.subTotal.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí giao hàng</span>
              <span>{order.shippingFee.toLocaleString('vi-VN')} đ</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-medium bg-green-50 px-2 py-1 -mx-2 rounded">
                <span>Giảm giá Voucher</span>
                <span>- {order.discountAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            )}
            
            <div className="flex justify-between items-center border-t border-dashed border-gray-300 pt-3 mt-2">
              <span className="text-base font-bold text-gray-800">Tổng thanh toán</span>
              <span className="text-2xl font-extrabold text-orange-600">{order.finalTotal.toLocaleString('vi-VN')} đ</span>
            </div>

            {/* Trạng thái thanh toán (COD / VNPAY) */}
            <div className="pt-2 flex justify-between items-center text-xs text-gray-500">
              <span>Phương thức: <strong className="text-gray-700">{order.paymentMethod}</strong></span>
              <span className={`px-2 py-1 rounded font-medium ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.paymentStatus === 'PAID' ? '✓ Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}