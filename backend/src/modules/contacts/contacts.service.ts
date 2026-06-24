import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ContactQueryDto } from './dto/contact-query.dto';
import { SaveContactDto, UpdateContactDto } from './dto/save-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ContactQueryDto = {}) {
    const and: Prisma.ContactFeedbackWhereInput[] = [];

    if (query.q) {
      and.push({
        OR: [
          { name: { contains: query.q, mode: 'insensitive' } },
          { email: { contains: query.q, mode: 'insensitive' } },
          { phone: { contains: query.q, mode: 'insensitive' } },
          { subject: { contains: query.q, mode: 'insensitive' } },
          { message: { contains: query.q, mode: 'insensitive' } },
        ],
      });
    }

    if (query.status) {
      and.push({ status: query.status });
    }

    const where: Prisma.ContactFeedbackWhereInput = and.length ? { AND: and } : {};
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);

    return this.prisma.$transaction(async (tx) => {
      const [total, data] = await Promise.all([
        tx.contactFeedback.count({ where }),
        tx.contactFeedback.findMany({
          where,
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

  create(data: SaveContactDto) {
    return this.prisma.contactFeedback.create({ data });
  }

  update(id: string, data: UpdateContactDto) {
    return this.prisma.contactFeedback.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.contactFeedback.delete({
      where: { id },
    });
  }
}
