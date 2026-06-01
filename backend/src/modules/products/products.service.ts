import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        variants: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findFeatured() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        brand: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
  }

  findOne(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  update(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}

