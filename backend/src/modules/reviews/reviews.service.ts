import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ReviewQueryDto } from './dto/review-query.dto';
import { SaveReviewDto, UpdateReviewDto } from './dto/save-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly reviewInclude = {
    product: {
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
      },
    },
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    },
  } satisfies Prisma.ReviewInclude;

  findAll(query: ReviewQueryDto = {}) {
    const where: Prisma.ReviewWhereInput = {
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.rating ? { rating: Number(query.rating) } : {}),
      ...(query.visibility === 'visible' || query.isVisible === 'true' ? { isVisible: true } : {}),
      ...(query.visibility === 'hidden' || query.isVisible === 'false' ? { isVisible: false } : {}),
    };

    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);

    return this.prisma.$transaction(async (tx) => {
      const [total, data] = await Promise.all([
        tx.review.count({ where }),
        tx.review.findMany({
          where,
          include: this.reviewInclude,
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
      include: this.reviewInclude,
    });
  }

  remove(id: string) {
    return this.prisma.review.update({
      where: { id },
      data: { isVisible: false },
      include: this.reviewInclude,
    });
  }
}
