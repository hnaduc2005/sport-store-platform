import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { SaveReviewDto, UpdateReviewDto } from './dto/save-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Post()
  create(@Body() data: SaveReviewDto) {
    return this.reviewsService.create(data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() data: UpdateReviewDto) {
    return this.reviewsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
