import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveCouponDto, UpdateCouponDto } from './dto/save-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findByCode(code: string) {
    return this.prisma.coupon.findUnique({
      where: { code },
    });
  }

  async create(data: SaveCouponDto) {
    this.validateCoupon(data);

    try {
      return await this.prisma.coupon.create({
        data: this.mapCouponCreateData(data),
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  async update(id: string, data: UpdateCouponDto) {
    const existing = await this.ensureExists(id);
    this.validateCoupon({
      discountType: data.discountType ?? existing.discountType,
      value: data.value ?? Number(existing.value),
      startsAt: data.startsAt !== undefined ? data.startsAt : existing.startsAt?.toISOString() ?? null,
      endsAt: data.endsAt !== undefined ? data.endsAt : existing.endsAt?.toISOString() ?? null,
    });

    try {
      return await this.prisma.coupon.update({
        where: { id },
        data: this.mapCouponUpdateData(data),
      });
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  async remove(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (coupon._count.orders > 0) {
      throw new BadRequestException('Cannot delete a coupon that has already been used in orders');
    }

    return this.prisma.coupon.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  private mapCouponCreateData(data: SaveCouponDto): Prisma.CouponUncheckedCreateInput {
    return {
      code: data.code.trim().toUpperCase(),
      description: data.description || null,
      discountType: data.discountType,
      value: data.value,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      usageLimit: data.usageLimit ?? null,
      isActive: data.isActive ?? true,
    };
  }

  private mapCouponUpdateData(data: UpdateCouponDto): Prisma.CouponUncheckedUpdateInput {
    return {
      ...(data.code !== undefined ? { code: data.code.trim().toUpperCase() } : {}),
      ...(data.description !== undefined ? { description: data.description || null } : {}),
      ...(data.discountType !== undefined ? { discountType: data.discountType } : {}),
      ...(data.value !== undefined ? { value: data.value } : {}),
      ...(data.startsAt !== undefined ? { startsAt: data.startsAt ? new Date(data.startsAt) : null } : {}),
      ...(data.endsAt !== undefined ? { endsAt: data.endsAt ? new Date(data.endsAt) : null } : {}),
      ...(data.usageLimit !== undefined ? { usageLimit: data.usageLimit ?? null } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    };
  }

  private handleUniqueConstraint(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Coupon code already exists');
    }

    throw error;
  }

  private validateCoupon(data: Pick<SaveCouponDto, 'discountType' | 'value' | 'startsAt' | 'endsAt'>) {
    if (data.discountType === 'PERCENTAGE' && Number(data.value) > 100) {
      throw new BadRequestException('Percentage discount cannot be greater than 100');
    }

    if (data.startsAt && data.endsAt && new Date(data.startsAt) > new Date(data.endsAt)) {
      throw new BadRequestException('Coupon start date must be before end date');
    }
  }
}
