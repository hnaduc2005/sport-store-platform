import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
  create(@Body() data: Prisma.CategoryCreateInput) {
    return this.categoriesService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.CategoryUpdateInput) {
    return this.categoriesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}

