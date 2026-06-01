import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  findOne(slug: string) {
    return this.prisma.brand.findUnique({
      where: { slug },
      include: {
        products: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  create(data: Prisma.BrandCreateInput) {
    return this.prisma.brand.create({ data });
  }

  update(id: string, data: Prisma.BrandUpdateInput) {
    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.brand.delete({
      where: { id },
    });
  }
}

