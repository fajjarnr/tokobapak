export class CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  addedAt: string;
}

export class Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}
