import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.favoritesService.findByUser(userId);
  }

  @Post()
  create(@Body() data: Prisma.FavoriteUncheckedCreateInput) {
    return this.favoritesService.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favoritesService.remove(id);
  }
}

