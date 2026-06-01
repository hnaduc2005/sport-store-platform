import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() data: Prisma.OrderCreateInput) {
    return this.ordersService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.OrderUpdateInput) {
    return this.ordersService.update(id, data);
  }
}

