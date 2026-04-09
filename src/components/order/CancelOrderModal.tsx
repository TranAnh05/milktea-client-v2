// src/components/orders/CancelOrderModal.tsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '@/services/orderService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

const REASONS = [
  "Tôi muốn thay đổi món ăn/đồ uống",
  "Tôi muốn thay đổi địa chỉ nhận hàng",
  "Thời gian giao hàng quá lâu",
  "Tôi tìm thấy mã giảm giá tốt hơn",
  "Đổi ý, không muốn mua nữa",
  "Lý do khác"
];

export default function CancelOrderModal({ isOpen, onClose, orderId, onSuccess }: Props) {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmCancel = async () => {
    const finalReason = selectedReason === "Lý do khác" ? otherReason : selectedReason;
    
    if (selectedReason === "Lý do khác" && !otherReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn.");
      return;
    }

    setIsSubmitting(true);
    try {
      await orderService.cancelOrder(orderId, finalReason);
      toast.success("Đã hủy đơn hàng thành công.");
      onSuccess(); // Báo cho OrderCard biết để tải lại trang
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể hủy đơn lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Hủy đơn hàng {orderId}</h3>
        <p className="text-sm text-gray-500 mb-5">Vui lòng cho quán biết lý do bạn muốn hủy đơn nhé:</p>

        <div className="space-y-3 mb-6">
          {REASONS.map(reason => (
            <label key={reason} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-50">
              <input 
                type="radio" 
                name="cancelReason" 
                value={reason} 
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-700 text-sm">{reason}</span>
            </label>
          ))}

          {/* Ô nhập tay nếu chọn Lý do khác */}
          {selectedReason === "Lý do khác" && (
            <textarea
              rows={2}
              placeholder="Nhập lý do của bạn..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              className="w-full mt-2 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Đóng
          </button>
          <button 
            onClick={handleConfirmCancel}
            disabled={isSubmitting}
            className={`px-4 py-2 font-medium text-white rounded-lg transition-colors
              ${isSubmitting ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'}`}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
          </button>
        </div>
      </div>
    </div>
  );
}