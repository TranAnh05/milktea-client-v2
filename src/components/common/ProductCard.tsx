import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import type { ProductResponse } from '@/types/product.types';
import { formatCurrency } from '@/utils/formatters';

interface ProductCardProps {
  product: ProductResponse;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const hasDiscount = product.discountPercent > 0;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative">
      
      {/* Badge Giảm giá */}
      {hasDiscount && (
        <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
          -{product.discountPercent}%
        </div>
      )}

      {/* Hình ảnh sản phẩm */}
      <Link to={`/product/${product.slug}`} className="relative h-56 overflow-hidden bg-gray-50 flex items-center justify-center">
        {/* Dùng ảnh placeholder nếu chưa có link thật */}
        <img 
          src={`/assets/${product.thumbnailUrl}`} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </Link>

      {/* Nội dung chi tiết */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Đánh giá */}
        <div className="flex items-center gap-1 mb-2 text-amber-500 text-xs font-medium">
          <Star size={14} fill="currentColor" />
          <span>{product.averageRating}</span>
        </div>

        {/* Tên sản phẩm */}
        <Link to={`/product/${product.slug}`} className="mb-2">
          <h3 className="text-gray-900 font-bold text-lg line-clamp-2 hover:text-amber-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Khu vực Giá & Nút Add to Cart */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
          <div>
            <div className="text-amber-600 font-extrabold text-lg">
              {formatCurrency(product.promotionalPrice)}
            </div>
            {hasDiscount && (
              <div className="text-gray-400 text-sm line-through decoration-gray-300">
                {formatCurrency(product.originalPrice)}
              </div>
            )}
          </div>

          <button 
            className="w-10 h-10 bg-gray-50 text-gray-900 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all duration-300"
            title="Thêm vào giỏ hàng"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};