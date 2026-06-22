import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
            variant: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { variants: true },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    const variant = dto.variantId ? product.variants.find((item) => item.id === dto.variantId) : undefined;
    const availableStock = variant?.stock ?? product.stock;

    if (availableStock < dto.quantity) {
      throw new BadRequestException('Not enough stock for this product');
    }

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
      },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + dto.quantity },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId,
        quantity: dto.quantity,
      },
    });
  }

  async updateItem(itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true, variant: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const availableStock = item.variant?.stock ?? item.product.stock;

    if (availableStock < dto.quantity) {
      throw new BadRequestException('Not enough stock for this product');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });
  }

  removeItem(itemId: string) {
    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }
}
