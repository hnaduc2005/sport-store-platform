import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DiscountType, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly orderInclude = {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    },
    coupon: true,
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
    },
  } satisfies Prisma.OrderInclude;

  findAll(query: OrderQueryDto = {}) {
    const and: Prisma.OrderWhereInput[] = [];

    if (query.q) {
      and.push({
        OR: [
          { code: { contains: query.q, mode: 'insensitive' } },
          { customerName: { contains: query.q, mode: 'insensitive' } },
          { phone: { contains: query.q, mode: 'insensitive' } },
          { address: { contains: query.q, mode: 'insensitive' } },
          { user: { email: { contains: query.q, mode: 'insensitive' } } },
          { user: { name: { contains: query.q, mode: 'insensitive' } } },
        ],
      });
    }

    if (query.status) {
      and.push({ status: query.status });
    }

    if (query.paymentStatus) {
      and.push({ paymentStatus: query.paymentStatus });
    }

    const where: Prisma.OrderWhereInput = and.length ? { AND: and } : {};
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);

    return this.prisma.$transaction(async (tx) => {
      const [total, data] = await Promise.all([
        tx.order.count({ where }),
        tx.order.findMany({
          where,
          include: this.orderInclude,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          pageCount: Math.max(Math.ceil(total / limit), 1),
        },
      };
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

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.orderInclude,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
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
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (data.status) {
      this.validateStatusTransition(order.status, data.status);
    }

    return this.prisma.order.update({
      where: { id },
      data,
      include: this.orderInclude,
    });
  }

  private validateStatusTransition(current: OrderStatus, next: OrderStatus) {
    if (current === next) return;

    if (current === OrderStatus.DELIVERED || current === OrderStatus.CANCELLED) {
      throw new BadRequestException('Delivered or cancelled orders cannot change status');
    }

    if (next === OrderStatus.CANCELLED) return;

    const orderFlow = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];

    if (orderFlow.indexOf(next) < orderFlow.indexOf(current)) {
      throw new BadRequestException('Order status cannot move backward');
    }
  }
}
