import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.brandsService.findOne(slug);
  }

  @Post()
  create(@Body() data: Prisma.BrandCreateInput) {
    return this.brandsService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.BrandUpdateInput) {
    return this.brandsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}

