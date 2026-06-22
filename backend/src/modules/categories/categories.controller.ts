import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.categoriesService.findOne(slug);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  create(@Body() data: Prisma.CategoryCreateInput) {
    return this.categoriesService.create(data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() data: Prisma.CategoryUpdateInput) {
    return this.categoriesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
