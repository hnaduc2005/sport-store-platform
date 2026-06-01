import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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
        items: true,
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

  create(data: Prisma.OrderCreateInput) {
    return this.prisma.order.create({ data });
  }

  update(id: string, data: Prisma.OrderUpdateInput) {
    return this.prisma.order.update({
      where: { id },
      data,
    });
  }
}

