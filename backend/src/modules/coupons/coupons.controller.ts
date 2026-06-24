import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { CouponsService } from './coupons.service';
import { SaveCouponDto, UpdateCouponDto } from './dto/save-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.couponsService.findByCode(code);
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  create(@Body() data: SaveCouponDto) {
    return this.couponsService.create(data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() data: UpdateCouponDto) {
    return this.couponsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
