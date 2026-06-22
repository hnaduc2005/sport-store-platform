import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveContactDto, UpdateContactDto } from './dto/save-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.contactFeedback.findMany({
      orderBy: { createdAt: 'desc' },
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
