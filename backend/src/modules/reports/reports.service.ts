import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private bucketKey(date: Date, period: 'day' | 'month') {
    if (period === 'month') {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    return date.toISOString().slice(0, 10);
  }

  private bucketLabel(date: Date, period: 'day' | 'month') {
    if (period === 'month') {
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }

    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }

  private buildBuckets(period: 'day' | 'month') {
    const now = new Date();
    const buckets: Array<{ key: string; label: string; revenue: number; orders: number }> = [];

    if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

      for (let index = 0; index < 12; index += 1) {
        const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
        buckets.push({ key: this.bucketKey(date, period), label: this.bucketLabel(date, period), revenue: 0, orders: 0 });
      }

      return { buckets, start };
    }

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 13);

    for (let index = 0; index < 14; index += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      buckets.push({ key: this.bucketKey(date, period), label: this.bucketLabel(date, period), revenue: 0, orders: 0 });
    }

    return { buckets, start };
  }

  async salesSummary() {
    const [orders, users, products, contacts, newContacts, reviews, pendingOrders] = await Promise.all([
      this.prisma.order.aggregate({
        _count: { _all: true },
        _sum: { total: true },
      }),
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.contactFeedback.count(),
      this.prisma.contactFeedback.count({ where: { status: 'NEW' } }),
      this.prisma.review.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalOrders: orders._count._all,
      totalRevenue: orders._sum.total ?? 0,
      totalUsers: users,
      totalProducts: products,
      totalContacts: contacts,
      newContacts,
      totalReviews: reviews,
      pendingOrders,
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

  async revenueSeries(query: ReportQueryDto = {}) {
    const period = query.period ?? 'day';
    const { buckets, start } = this.buildBuckets(period);
    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start },
        status: { not: OrderStatus.CANCELLED },
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    for (const order of orders) {
      const key = this.bucketKey(order.createdAt, period);
      const bucket = bucketMap.get(key);

      if (bucket) {
        bucket.revenue += Number(order.total);
        bucket.orders += 1;
      }
    }

    return buckets;
  }

  async dashboard(query: ReportQueryDto = {}) {
    const [summary, recentOrders, topProducts, revenueSeries] = await Promise.all([
      this.salesSummary(),
      this.prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.topProducts(),
      this.revenueSeries(query),
    ]);

    return {
      summary,
      recentOrders,
      topProducts,
      revenueSeries,
    };
  }
}
