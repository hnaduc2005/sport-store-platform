import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveBrandDto, UpdateBrandDto } from './dto/save-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly brandInclude = {
    _count: {
      select: { products: true },
    },
  };

  findAll() {
    return this.prisma.brand.findMany({
      include: this.brandInclude,
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

  async create(data: SaveBrandDto) {
    try {
      return await this.prisma.brand.create({
        data,
        include: this.brandInclude,
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  async update(id: string, data: UpdateBrandDto) {
    const existing = await this.prisma.brand.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      throw new NotFoundException('Brand not found');
    }

    try {
      return await this.prisma.brand.update({
        where: { id },
        data,
        include: this.brandInclude,
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: this.brandInclude,
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (brand._count.products > 0) {
      throw new BadRequestException('Cannot delete a brand that still has products');
    }

    return this.prisma.brand.delete({
      where: { id },
    });
  }

  private handleUniqueConstraint(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Brand slug already exists');
    }

    throw error;
  }
}
