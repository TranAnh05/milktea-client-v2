export interface ProductResponse {
    id: number;
    name: string;
    slug: string;
    thumbnailUrl: string;
    averageRating: number;
    originalPrice: number;
    promotionalPrice: number;
    discountPercent: number;
}

export interface SizeDto {
  id: number;
  name: string;
  priceSurcharge: number;
}

export interface ToppingDto {
  id: number;
  name: string;
  price: number;
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  averageRating: number;
  reviewCount: number;
  categoryName: string;
  categorySlug: string;
  originalPrice: number;
  promotionalPrice: number;
  discountPercent: number;
  sizes: SizeDto[];
  toppings: ToppingDto[];
}
