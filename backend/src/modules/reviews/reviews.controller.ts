import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Post()
  create(@Body() data: Prisma.ReviewUncheckedCreateInput) {
    return this.reviewsService.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}

