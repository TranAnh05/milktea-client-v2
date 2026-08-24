import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { CartItemType } from '@/types/cart.types';
import { cartService } from '@/services/cartService';
import { toast } from 'react-hot-toast';

interface CartState {
  cartItems: CartItemType[];
}

const getInitialCart = (): CartItemType[] => {
  const savedCart = localStorage.getItem('guest_cart');
  return savedCart ? JSON.parse(savedCart) : [];
};

const initialState: CartState = {
  cartItems: getInitialCart(),
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const response = await cartService.getCart();
  return (response.data?.cartItems || []) as CartItemType[];
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItemType>) => {
      const newItem = action.payload;
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.signature === newItem.signature
      );
      if (existingItemIndex >= 0) {
        state.cartItems[existingItemIndex].quantity += newItem.quantity;
        state.cartItems[existingItemIndex].totalPrice =
          state.cartItems[existingItemIndex].unitPrice * state.cartItems[existingItemIndex].quantity;
      } else {
        state.cartItems.push(newItem);
      }
      localStorage.setItem('guest_cart', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter((item) => item.signature !== action.payload);
      localStorage.setItem('guest_cart', JSON.stringify(state.cartItems));
      toast.success('Đã xóa khỏi giỏ hàng');
    },
    updateQuantity: (state, action: PayloadAction<{ signature: string; newQuantity: number }>) => {
      const { signature, newQuantity } = action.payload;
      const item = state.cartItems.find((i) => i.signature === signature);
      if (item && newQuantity >= 1) {
        item.quantity = newQuantity;
        item.totalPrice = item.unitPrice * newQuantity;
        localStorage.setItem('guest_cart', JSON.stringify(state.cartItems));
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('guest_cart');
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.cartItems = action.payload;
    });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
