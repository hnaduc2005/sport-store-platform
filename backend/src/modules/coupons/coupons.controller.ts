import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Post()
  create(@Body() data: Prisma.CouponCreateInput) {
    return this.couponsService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.CouponUpdateInput) {
    return this.couponsService.update(id, data);
  }
}

