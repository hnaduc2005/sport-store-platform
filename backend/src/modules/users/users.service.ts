import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: UserQueryDto = {}) {
    const and: Prisma.UserWhereInput[] = [];

    if (query.q) {
      and.push({
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { email: { contains: query.q, mode: 'insensitive' } },
          { phone: { contains: query.q, mode: 'insensitive' } },
        ],
      });
    }

    if (query.role) {
      and.push({ role: query.role });
    }

    const where: Prisma.UserWhereInput = and.length ? { AND: and } : {};
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);

    return this.prisma.$transaction(async (tx) => {
      const [total, data] = await Promise.all([
        tx.user.count({ where }),
        tx.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
            _count: {
              select: {
                orders: true,
                reviews: true,
                favorites: true,
              },
            },
          },
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

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            items: true,
          },
        },
        favorites: {
          include: {
            product: true,
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            product: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === Role.ADMIN && role === Role.CUSTOMER) {
      const adminCount = await this.prisma.user.count({ where: { role: Role.ADMIN } });

      if (adminCount <= 1) {
        throw new BadRequestException('Cannot demote the last admin account');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            favorites: true,
          },
        },
      },
    });
  }
}
