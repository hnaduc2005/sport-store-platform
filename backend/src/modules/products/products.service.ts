import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { SaveProductDto, SaveProductVariantDto, UpdateProductDto } from './dto/save-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly productInclude = {
    category: true,
    brand: true,
    variants: {
      where: { isActive: true },
      orderBy: { createdAt: 'asc' as const },
    },
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
  } satisfies Prisma.ProductInclude;

  private mapVariants(productId: string, variants: SaveProductVariantDto[] = []) {
    return variants
      .filter((variant) => variant.name.trim() && variant.sku.trim())
      .map((variant) => ({
        productId,
        name: variant.name.trim(),
        sku: variant.sku.trim(),
        size: variant.size?.trim() || null,
        color: variant.color?.trim() || null,
        priceAdjustment: variant.priceAdjustment ?? 0,
        stock: variant.stock,
        isActive: true,
      }));
  }

  private mapVariantUpdateData(variant: SaveProductVariantDto) {
    return {
      name: variant.name.trim(),
      sku: variant.sku.trim(),
      size: variant.size?.trim() || null,
      color: variant.color?.trim() || null,
      priceAdjustment: variant.priceAdjustment ?? 0,
      stock: variant.stock,
      isActive: true,
    };
  }

  async findAll(query: ProductQueryDto = {}) {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
              { shortDescription: { contains: query.q, mode: 'insensitive' } },
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
      include: this.productInclude,
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

  findAdminAll(query: AdminProductQueryDto = {}) {
    const and: Prisma.ProductWhereInput[] = [];

    if (query.q) {
      and.push({
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { description: { contains: query.q, mode: 'insensitive' } },
          { shortDescription: { contains: query.q, mode: 'insensitive' } },
          { sku: { contains: query.q, mode: 'insensitive' } },
        ],
      });
    }

    if (query.category) {
      and.push({ OR: [{ categoryId: query.category }, { category: { slug: query.category } }] });
    }

    if (query.brand) {
      and.push({ OR: [{ brandId: query.brand }, { brand: { slug: query.brand } }] });
    }

    if (query.status === 'active') {
      and.push({ isActive: true });
    }

    if (query.status === 'inactive') {
      and.push({ isActive: false });
    }

    if (query.stockStatus === 'out-of-stock') {
      and.push({ stock: { lte: 0 } });
    }

    if (query.stockStatus === 'low-stock') {
      and.push({ stock: { gt: 0, lte: 10 } });
    }

    if (query.stockStatus === 'in-stock') {
      and.push({ stock: { gt: 10 } });
    }

    const where: Prisma.ProductWhereInput = and.length ? { AND: and } : {};
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);

    return this.prisma.$transaction(async (tx) => {
      const [total, data] = await Promise.all([
        tx.product.count({ where }),
        tx.product.findMany({
          where,
          include: this.productInclude,
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

  async findAdminOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.productInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
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
      include: this.productInclude,
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(data: SaveProductDto) {
    this.validatePricing(data.price, data.salePrice ?? null);

    try {
      const product = await this.prisma.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          sku: data.sku,
          price: data.price,
          salePrice: data.salePrice ?? null,
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

      const variants = this.mapVariants(product.id, data.variants);

      if (variants.length) {
        await this.prisma.productVariant.createMany({ data: variants });
      }

      return this.prisma.product.findUnique({
        where: { id: product.id },
        include: this.productInclude,
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  async update(id: string, data: UpdateProductDto) {
    const { categoryId, brandId, variants, ...productData } = data;

    const existing = await this.prisma.product.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        price: true,
        salePrice: true,
      },
    });

    this.validatePricing(
      data.price ?? Number(existing.price),
      data.salePrice !== undefined ? data.salePrice : existing.salePrice === null ? null : Number(existing.salePrice),
    );

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: {
            ...productData,
            ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
            ...(brandId ? { brand: { connect: { id: brandId } } } : {}),
          },
        });

        if (variants !== undefined) {
          await this.syncVariants(tx, id, variants);
        }

        return tx.product.findUnique({
          where: { id },
          include: this.productInclude,
        });
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  bulkStatus(ids: string[], isActive: boolean) {
    return this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive },
    });
  }

  async remove(id: string) {
    const [orderItems, cartItems] = await Promise.all([
      this.prisma.orderItem.count({ where: { productId: id } }),
      this.prisma.cartItem.count({ where: { productId: id } }),
    ]);

    if (orderItems || cartItems) {
      return this.prisma.product.update({
        where: { id },
        data: { isActive: false },
        include: this.productInclude,
      });
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  private handleUniqueConstraint(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target) ? error.meta?.target.join(', ') : 'unique field';
      throw new ConflictException(`Product ${target} already exists`);
    }

    throw error;
  }

  private validatePricing(price: number | Prisma.Decimal, salePrice: number | Prisma.Decimal | null | undefined) {
    const priceValue = Number(price);
    const salePriceValue = salePrice === null || salePrice === undefined ? null : Number(salePrice);

    if (salePriceValue !== null && salePriceValue > priceValue) {
      throw new BadRequestException('Sale price cannot be greater than original price');
    }
  }

  private async syncVariants(tx: Prisma.TransactionClient, productId: string, variants: SaveProductVariantDto[]) {
    const nextVariants = variants.filter((variant) => variant.name.trim() && variant.sku.trim());
    const nextIds = new Set(nextVariants.map((variant) => variant.id).filter((id): id is string => Boolean(id)));
    const existingVariants = await tx.productVariant.findMany({
      where: { productId, isActive: true },
      select: { id: true },
    });

    for (const variant of nextVariants) {
      const data = this.mapVariantUpdateData(variant);

      if (variant.id) {
        const result = await tx.productVariant.updateMany({
          where: {
            id: variant.id,
            productId,
          },
          data,
        });

        if (!result.count) {
          throw new BadRequestException('Product variant does not belong to this product');
        }
      } else {
        await tx.productVariant.create({
          data: {
            productId,
            ...data,
          },
        });
      }
    }

    for (const existing of existingVariants) {
      if (nextIds.has(existing.id)) continue;

      const [cartItems, orderItems] = await Promise.all([
        tx.cartItem.count({ where: { variantId: existing.id } }),
        tx.orderItem.count({ where: { variantId: existing.id } }),
      ]);

      if (cartItems || orderItems) {
        await tx.productVariant.update({
          where: { id: existing.id },
          data: { isActive: false },
        });
      } else {
        await tx.productVariant.delete({ where: { id: existing.id } });
      }
    }
  }
}
