import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { Cart, CartItem } from './interfaces/cart.interface';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  private readonly redis: Redis;
  private readonly ttl: number = 30 * 24 * 60 * 60; // 30 days

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
  }

  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getCart(userId: string): Promise<Cart> {
    const key = this.getCartKey(userId);
    const data = await this.redis.get(key);

    if (!data) {
      return {
        userId,
        items: [],
        updatedAt: new Date().toISOString(),
      };
    }

    return JSON.parse(data) as Cart;
  }

  async addToCart(userId: string, itemDto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(userId);

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId === itemDto.productId &&
        item.variantId === itemDto.variantId,
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += itemDto.quantity;
      // Optionally update price if it changed, currently keeping existing behavior
    } else {
      const newItem: CartItem = {
        productId: itemDto.productId,
        variantId: itemDto.variantId,
        quantity: itemDto.quantity,
        price: itemDto.price,
        addedAt: new Date().toISOString(),
      };
      cart.items.push(newItem);
    }

    cart.updatedAt = new Date().toISOString();
    await this.saveCart(userId, cart);
    return cart;
  }

  async updateQuantity(
    userId: string,
    itemId: string,
    quantity: number,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);

    // Naive implementation assuming itemId is productId for now.
    // Ideally we need a unique cart item ID or composite key logic in the route.
    // Let's assume the controller handles finding the right item, or we simplify:

    const itemIndex = cart.items.findIndex((item) => item.productId === itemId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      cart.updatedAt = new Date().toISOString();
      await this.saveCart(userId, cart);
    }

    return cart;
  }

  async removeItem(
    userId: string,
    productId: string,
    variantId?: string,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);

    cart.items = cart.items.filter(
      (item) => !(item.productId === productId && item.variantId === variantId),
    );

    cart.updatedAt = new Date().toISOString();
    await this.saveCart(userId, cart);
    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    const key = this.getCartKey(userId);
    await this.redis.del(key);
  }

  private async saveCart(userId: string, cart: Cart): Promise<void> {
    const key = this.getCartKey(userId);
    await this.redis.set(key, JSON.stringify(cart), 'EX', this.ttl);
  }
}
