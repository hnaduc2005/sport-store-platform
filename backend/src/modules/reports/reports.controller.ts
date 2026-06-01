import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
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

