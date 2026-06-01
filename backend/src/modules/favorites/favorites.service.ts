import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: Prisma.FavoriteUncheckedCreateInput) {
    return this.prisma.favorite.create({ data });
  }

  remove(id: string) {
    return this.prisma.favorite.delete({
      where: { id },
    });
  }
}

