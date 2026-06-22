import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { ContactsService } from './contacts.service';
import { SaveContactDto, UpdateContactDto } from './dto/save-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  findAll() {
    return this.contactsService.findAll();
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
