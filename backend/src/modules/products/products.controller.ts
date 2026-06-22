import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { ProductQueryDto } from './dto/product-query.dto';
import { SaveProductDto, UpdateProductDto } from './dto/save-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  create(@Body() data: SaveProductDto) {
    return this.productsService.create(data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
