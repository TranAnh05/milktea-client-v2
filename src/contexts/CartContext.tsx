/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
// src/contexts/CartContext.tsx
import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import type { CartItemType } from '@/types/cart.types';
import { cartService, type CartItemRequest } from '@/services/cartService';

interface CartContextType {
  cartItems: CartItemType[];
  addToCart: (item: CartItemType) => Promise<void>; 
  removeFromCart: (signature: string) => void; 
  updateQuantity: (signature: string, newQuantity: number) => Promise<void>;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  const fetchCartFromDB = useCallback(async () => {
    try {
      const response = await cartService.getCart();
      if (response.data && response.data.cartItems) {
        setCartItems(response.data.cartItems);
      }
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng từ máy chủ:", error);
    }
  }, []);

  const mapItemToRequest = (item: CartItemType): CartItemRequest => ({
    signature: item.signature,
    productId: item.productId,
    sizeId: item.sizeId,
    sugarLevel: item.sugarLevel,
    iceLevel: item.iceLevel,
    toppingIds: item.toppings.map(t => t.id),
    quantity: item.quantity,
  });

  // --- 1. THEO DÕI TRẠNG THÁI LOGIN VÀ XỬ LÝ MERGE ---
  useEffect(() => {
    const handleAuthChange = async () => {
      if (isAuthenticated) {
        // KHÁCH VỪA LOGIN THÀNH CÔNG: Kích hoạt MERGE CART!
        const savedCart = localStorage.getItem('guest_cart');
        if (savedCart) {
          try {
            const guestItems: CartItemType[] = JSON.parse(savedCart);
            if (guestItems.length > 0) {
              const requestPayload = guestItems.map(mapItemToRequest);
              
              // Gọi API Merge
              await cartService.mergeCart(requestPayload);
              toast.success("Đã đồng bộ giỏ hàng của bạn!");
              
              // Merge xong thì xóa LocalStorage cho sạch
              localStorage.removeItem('guest_cart');
            }
          } catch (error) {
            console.error("Lỗi khi gộp giỏ hàng:", error);
          }
        }
        
        // Dù có merge hay không, sau cùng vẫn phải fetch data mới nhất về
        await fetchCartFromDB();

      } else {
        // KHÁCH VÃNG LAI: Chỉ đọc LocalStorage
        const savedCart = localStorage.getItem('guest_cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        } else {
          setCartItems([]); // Reset nếu đăng xuất
        }
      }
    };

    handleAuthChange();
  }, [isAuthenticated, fetchCartFromDB]);

  // --- 2. LƯU GIỎ HÀNG GUEST VÀO LOCAL STORAGE ---
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // --- 3. HÀM THÊM / CẬP NHẬT MÓN ---
  const addToCart = async (newItem: CartItemType) => {
    // 1. Cập nhật state ở Frontend NGAY LẬP TỨC để UI mượt mà
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(item => item.signature === newItem.signature);
      if (existingItemIndex >= 0) {
        const updatedCart = [...prev];
        updatedCart[existingItemIndex].quantity += newItem.quantity;
        updatedCart[existingItemIndex].totalPrice = updatedCart[existingItemIndex].unitPrice * updatedCart[existingItemIndex].quantity;
        return updatedCart;
      } else {
        return [...prev, newItem];
      }
    });

    // 2. Nếu đã Login, bắn API lên Backend để lưu ngầm
    if (isAuthenticated) {
      try {
        await cartService.addOrUpdateCartItem(mapItemToRequest(newItem));
        // Tùy chọn: await fetchCartFromDB(); // Nếu muốn chắc chắn DB trả về chuẩn
      } catch (error) {
        console.error("Lỗi khi lưu giỏ hàng vào DB:", error);
        toast.error("Lưu đồng bộ thất bại, nhưng đã lưu trên trình duyệt.");
      }
    }
  };

  const updateQuantity = async (signature: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems(prev => prev.map(item => {
      if (item.signature === signature) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity
        };
      }
      return item;
    }));

    if (isAuthenticated) {
      try {
        await cartService.updateQuantity(signature, newQuantity);
      } catch (error) {
        toast.error("Lỗi đồng bộ máy chủ!");
        // (Tùy chọn: Nếu lỗi có thể gọi lại fetchCartFromDB() để roll-back UI)
      }
    }
  };

  // --- 5. HÀM XÓA MÓN KHỎI GIỎ HÀNG ---
  const removeFromCart = async (signature: string) => { // Nhớ thêm async ở đây nhé
    // 1. Xóa ngay trên UI
    setCartItems(prev => prev.filter(item => item.signature !== signature));
    toast.success('Đã xóa khỏi giỏ hàng');

    // 2. Gọi API để xóa dưới Database
    if (isAuthenticated) {
      try {
        await cartService.removeFromCart(signature);
      } catch (error) {
        console.error("Lỗi khi xóa món khỏi DB:", error);
        toast.error("Lỗi đồng bộ khi xóa!");
      }
    }
  };

  const clearCart = () => {
    setCartItems([]);
    if (!isAuthenticated) {
      localStorage.removeItem('guest_cart');
    }
  };

  // --- TÍNH TOÁN (Dùng useMemo để tránh render lại thừa thãi) ---
  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};