// src/types/cart.types.ts

export interface CartTopping {
  id: number;
  name: string;
  price: number;
}

export interface CartItemType {
  signature: string; // Khóa chính: Gộp từ (ProductID + SizeID + Sugar + Ice + ToppingIDs)
  productId: number;
  productName: string;
  thumbnailUrl: string;
  sizeId: number;
  sizeName: string;
  sugarLevel: string;
  iceLevel: string;
  toppings: CartTopping[];
  unitPrice: number; // Giá 1 ly (đã cộng size + topping)
  quantity: number;
  totalPrice: number; // unitPrice * quantity
}