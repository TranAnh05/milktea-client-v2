// src/components/orders/OrderCard.tsx
import React, { useState } from 'react';
import CancelOrderModal from './CancelOrderModal';
import { Link } from 'react-router-dom';

interface OrderCardProps {
  order: any; // Type từ DTO OrderHistoryResponse
  onCancelSuccess: () => void;
}

// Cấu hình màu sắc và text cho từng trạng thái
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  PREPARING: { label: 'Đang pha chế', color: 'bg-blue-100 text-blue-800' },
  DELIVERING: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

export default function OrderCard({ order, onCancelSuccess }: OrderCardProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const statusConfig = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;

  // Format ngày giờ: "14:30 09/04/2026"
  const formattedDate = new Date(order.createdAt).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      
      {/* HEADER: Mã đơn + Trạng thái */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
        <div>
          <span className="font-bold text-gray-800">{order.orderId}</span>
          <span className="text-xs text-gray-500 ml-3">{formattedDate}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* BODY: Thông tin món (Rút gọn) */}
      <div className="p-4 flex items-center gap-4">
        <img 
          src={order.firstItemImage || '/placeholder.png'} 
          alt="Món ăn" 
          className="w-16 h-16 object-cover rounded-lg border border-gray-100"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{order.firstItemName}</h4>
          {order.totalItemCount > 1 && (
            <p className="text-sm text-gray-500 mt-1">
              và {order.totalItemCount - 1} sản phẩm khác...
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Tổng tiền</p>
          <p className="font-bold text-orange-600 text-lg">
            {order.finalTotal.toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {/* FOOTER: CÁC NÚT HÀNH ĐỘNG */}
      <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
        {/* Chỉ hiện nút Hủy nếu đơn đang PENDING */}
        {order.orderStatus === 'PENDING' && (
          <button 
            onClick={() => setIsCancelModalOpen(true)}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
          >
            Hủy đơn
          </button>
        )}
        
        <Link 
          to={`/account/orders/${order.orderId}`} 
          onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm font-medium transition-colors"
        >
          Xem chi tiết
        </Link>
      </div>

      {/* Nhúng Modal Hủy Đơn */}
      <CancelOrderModal 
        isOpen={isCancelModalOpen} 
        onClose={() => setIsCancelModalOpen(false)}
        orderId={order.orderId}
        onSuccess={() => {
          setIsCancelModalOpen(false);
          onCancelSuccess(); // Gọi ngược lên component cha để refetch list
        }}
      />
    </div>
  );
}