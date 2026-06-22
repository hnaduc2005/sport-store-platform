import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        coupon: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        coupon: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        coupon: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  async create(data: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: data.userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const inactiveItem = cart.items.find((item) => !item.product.isActive);

    if (inactiveItem) {
      throw new BadRequestException(`Product ${inactiveItem.product.name} is not available`);
    }

    const outOfStockItem = cart.items.find((item) => (item.variant?.stock ?? item.product.stock) < item.quantity);

    if (outOfStockItem) {
      throw new BadRequestException(`Product ${outOfStockItem.product.name} is out of stock`);
    }

    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.salePrice ?? item.product.price) * item.quantity;
    }, 0);
    const shippingFee = subtotal >= 1500000 ? 0 : 30000;
    let discount = 0;
    let coupon: { id: string; discountType: DiscountType; value: Prisma.Decimal; usageLimit: number | null; usedCount: number } | null =
      null;

    if (data.couponCode) {
      coupon = await this.prisma.coupon.findFirst({
        where: {
          code: data.couponCode.toUpperCase(),
          isActive: true,
          OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
          AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }],
        },
        select: {
          id: true,
          discountType: true,
          value: true,
          usageLimit: true,
          usedCount: true,
        },
      });

      if (coupon && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
        discount =
          coupon.discountType === DiscountType.PERCENTAGE
            ? Math.round((subtotal * Number(coupon.value)) / 100)
            : Number(coupon.value);
      }
    }

    const total = Math.max(subtotal + shippingFee - discount, 0);
    const code = `SS-${Date.now().toString().slice(-8)}`;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          code,
          user: { connect: { id: data.userId } },
          coupon: coupon ? { connect: { id: coupon.id } } : undefined,
          customerName: data.customerName,
          phone: data.phone,
          address: data.address,
          note: data.note,
          paymentMethod: data.paymentMethod,
          shippingFee,
          discount,
          total,
          items: {
            create: cart.items.map((item) => {
              const unitPrice = Number(item.product.salePrice ?? item.product.price);

              return {
                productId: item.productId,
                variantId: item.variantId,
                productName: item.product.name,
                variantName: item.variant?.name,
                unitPrice,
                quantity: item.quantity,
                total: unitPrice * item.quantity,
              };
            }),
          },
        },
        include: {
          items: true,
          coupon: true,
        },
      });

      await Promise.all(
        cart.items.flatMap((item) => {
          const updates: Array<Promise<unknown>> = [
            tx.product.update({
              where: { id: item.productId },
              data: {
                ...(item.variantId ? {} : { stock: { decrement: item.quantity } }),
                sold: { increment: item.quantity },
              },
            }),
          ];

          if (item.variantId) {
            updates.push(
              tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } },
              }),
            );
          }

          return updates;
        }),
      );

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });
  }

  async update(id: string, data: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id }, select: { id: true } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id },
      data,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
