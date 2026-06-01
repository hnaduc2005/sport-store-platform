import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findByCode(code: string) {
    return this.prisma.coupon.findUnique({
      where: { code },
    });
  }

  create(data: Prisma.CouponCreateInput) {
    return this.prisma.coupon.create({ data });
  }

  update(id: string, data: Prisma.CouponUpdateInput) {
    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }
}

