import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { ContactsService } from './contacts.service';
import { ContactQueryDto } from './dto/contact-query.dto';
import { SaveContactDto, UpdateContactDto } from './dto/save-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  findAll(@Query() query: ContactQueryDto) {
    return this.contactsService.findAll(query);
  }

  @Post()
  create(@Body() data: SaveContactDto) {
    return this.contactsService.create(data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() data: UpdateContactDto) {
    return this.contactsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
