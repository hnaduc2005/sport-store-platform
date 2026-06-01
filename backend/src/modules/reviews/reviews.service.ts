import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: Prisma.ReviewUncheckedCreateInput) {
    return this.prisma.review.create({ data });
  }

  remove(id: string) {
    return this.prisma.review.delete({
      where: { id },
    });
  }
}

