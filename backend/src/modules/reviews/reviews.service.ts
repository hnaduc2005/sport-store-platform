import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveReviewDto, UpdateReviewDto } from './dto/save-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.review.findMany({
      include: {
        product: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, isVisible: true },
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

  create(data: SaveReviewDto) {
    return this.prisma.review.upsert({
      where: {
        userId_productId: {
          userId: data.userId,
          productId: data.productId,
        },
      },
      update: {
        rating: data.rating,
        comment: data.comment,
        isVisible: true,
      },
      create: data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  update(id: string, data: UpdateReviewDto) {
    return this.prisma.review.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.review.delete({
      where: { id },
    });
  }
}
