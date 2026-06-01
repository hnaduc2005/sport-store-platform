import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async salesSummary() {
    const [orders, users, products] = await Promise.all([
      this.prisma.order.aggregate({
        _count: { _all: true },
        _sum: { total: true },
      }),
      this.prisma.user.count(),
      this.prisma.product.count(),
    ]);

    return {
      totalOrders: orders._count._all,
      totalRevenue: orders._sum.total ?? 0,
      totalUsers: users,
      totalProducts: products,
    };
  }

  topProducts() {
    return this.prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });
  }
}

