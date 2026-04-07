// src/services/cartService.ts
import axiosInstance from "@/config/axios";
import type { ApiResponse } from "@/types/auth.types";
import type { CartItemType } from "@/types/cart.types";

// DTO hứng dữ liệu từ API GET
export interface CartResponse {
    cartItems: CartItemType[];
    cartCount: number;
    cartTotal: number;
}

// DTO gửi lên API POST /items
export interface CartItemRequest {
    signature: string;
    productId: number;
    sizeId: number;
    sugarLevel: string;
    iceLevel: string;
    toppingIds: number[];
    quantity: number;
}

export const cartService = {
    // 1. Lấy toàn bộ giỏ hàng
    getCart: async (): Promise<ApiResponse<CartResponse>> => {
        return axiosInstance.get("/cart");
    },

    // 2. Thêm hoặc cập nhật 1 món
    addOrUpdateCartItem: async (
        request: CartItemRequest,
    ): Promise<ApiResponse<void>> => {
        return axiosInstance.post("/cart/items", request);
    },

    // 3. Gộp giỏ hàng từ LocalStorage
    mergeCart: async (
        cartItems: CartItemRequest[],
    ): Promise<ApiResponse<void>> => {
        return axiosInstance.post("/cart/merge", { cartItems });
    },

    updateQuantity: async (
        signature: string,
        quantity: number,
    ): Promise<ApiResponse<void>> => {
        return axiosInstance.put(
            `/cart/items?signature=${encodeURIComponent(signature)}&quantity=${quantity}`
        );
    },

    removeFromCart: async (signature: string): Promise<ApiResponse<void>> => {
        return axiosInstance.delete(
            `/cart/items?signature=${encodeURIComponent(signature)}`
        );
    },
};
