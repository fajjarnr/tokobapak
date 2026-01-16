import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';

@Controller('api/v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // In a real app, userId would come from a JWT guard/decorator
  // For MVP, we will accept it as a header or query param for testing
  private getUserId(req: any): string {
    // Mock user ID for now if not provided
    return 'user-123'; 
  }

  @Get()
  async getCart(@Query('userId') userId: string) {
    return this.cartService.getCart(userId || this.getUserId(null));
  }

  @Post('items')
  async addToCart(@Query('userId') userId: string, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(userId || this.getUserId(null), addToCartDto);
  }

  @Put('items/:productId')
  async updateQuantity(
    @Query('userId') userId: string,
    @Param('productId') productId: string,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    return this.cartService.updateQuantity(
      userId || this.getUserId(null), 
      productId, 
      updateQuantityDto.quantity
    );
  }

  @Delete('items/:productId')
  async removeItem(
    @Query('userId') userId: string,
    @Param('productId') productId: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.cartService.removeItem(userId || this.getUserId(null), productId, variantId);
  }

  @Delete()
  async clearCart(@Query('userId') userId: string) {
    return this.cartService.clearCart(userId || this.getUserId(null));
  }
}
