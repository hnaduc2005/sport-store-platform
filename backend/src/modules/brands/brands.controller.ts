import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthGuard, Roles } from '../auth/auth.guard';
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
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  create(@Body() data: Prisma.BrandCreateInput) {
    return this.brandsService.create(data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() data: Prisma.BrandUpdateInput) {
    return this.brandsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
