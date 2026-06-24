import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveCategoryDto, UpdateCategoryDto } from './dto/save-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly categoryInclude = {
    parent: true,
    children: true,
    _count: {
      select: { products: true, children: true },
    },
  };

  findAll() {
    return this.prisma.category.findMany({
      include: this.categoryInclude,
      orderBy: { name: 'asc' },
    });
  }

  findOne(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        products: {
          include: {
            brand: true,
          },
        },
      },
    });
  }

  async create(data: SaveCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          imageUrl: data.imageUrl,
          isActive: data.isActive ?? true,
          ...(data.parentId ? { parent: { connect: { id: data.parentId } } } : {}),
        },
        include: this.categoryInclude,
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  async update(id: string, data: UpdateCategoryDto) {
    if (data.parentId === id) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    const existing = await this.prisma.category.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.slug !== undefined ? { slug: data.slug } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
          ...(data.parentId !== undefined
            ? data.parentId
              ? { parent: { connect: { id: data.parentId } } }
              : { parent: { disconnect: true } }
            : {}),
        },
        include: this.categoryInclude,
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, children: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.products > 0) {
      throw new BadRequestException('Cannot delete a category that still has products');
    }

    if (category._count.children > 0) {
      throw new BadRequestException('Cannot delete a category that still has child categories');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  private handleUniqueConstraint(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Category slug already exists');
    }

    throw error;
  }
}
