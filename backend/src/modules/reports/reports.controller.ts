import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard)
@Roles('ADMIN')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  salesSummary() {
    return this.reportsService.salesSummary();
  }

  @Get('top-products')
  topProducts() {
    return this.reportsService.topProducts();
  }
}
