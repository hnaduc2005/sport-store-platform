import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  findByUser(@Param('userId') userId: string) {
    return this.cartService.findByUser(userId);
  }

  @Post(':userId/items')
  addItem(@Param('userId') userId: string, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Patch('items/:itemId')
  updateItem(@Param('itemId') itemId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(itemId, dto);
  }

  @Delete('items/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.cartService.removeItem(itemId);
  }
}

