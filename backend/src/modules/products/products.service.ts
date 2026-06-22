import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { SaveProductDto, UpdateProductDto } from './dto/save-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto = {}) {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
              { sku: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.brand ? { brand: { slug: query.brand } } : {}),
      ...(query.onSale === 'true' ? { salePrice: { not: null } } : {}),
    };

    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        variants: true,
        reviews: {
          where: { isVisible: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
    const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
    const filtered = products.filter((product) => {
      const price = Number(product.salePrice ?? product.price);

      return (minPrice === undefined || price >= minPrice) && (maxPrice === undefined || price <= maxPrice);
    });

    return filtered.sort((first, second) => {
      const firstPrice = Number(first.salePrice ?? first.price);
      const secondPrice = Number(second.salePrice ?? second.price);

      if (query.sort === 'price-asc') return firstPrice - secondPrice;
      if (query.sort === 'price-desc') return secondPrice - firstPrice;
      if (query.sort === 'best-selling') return second.sold - first.sold;

      return second.createdAt.getTime() - first.createdAt.getTime();
    });
  }

  findFeatured() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        brand: true,
        reviews: {
          where: { isVisible: true },
        },
      },
      orderBy: [{ sold: 'desc' }, { createdAt: 'desc' }],
      take: 8,
    });
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        variants: true,
        reviews: {
          where: { isVisible: true },
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
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  create(data: SaveProductDto) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        sku: data.sku,
        price: data.price,
        salePrice: data.salePrice,
        stock: data.stock,
        sold: data.sold ?? 0,
        images: data.images,
        isActive: data.isActive ?? true,
        category: { connect: { id: data.categoryId } },
        brand: { connect: { id: data.brandId } },
      },
      include: {
        category: true,
        brand: true,
      },
    });
  }

  update(id: string, data: UpdateProductDto) {
    const { categoryId, brandId, ...productData } = data;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
        ...(brandId ? { brand: { connect: { id: brandId } } } : {}),
      },
      include: {
        category: true,
        brand: true,
      },
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
