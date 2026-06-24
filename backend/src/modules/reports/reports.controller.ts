import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles } from '../auth/auth.guard';
import { ReportQueryDto } from './dto/report-query.dto';
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

  @Get('revenue-series')
  revenueSeries(@Query() query: ReportQueryDto) {
    return this.reportsService.revenueSeries(query);
  }

  @Get('dashboard')
  dashboard(@Query() query: ReportQueryDto) {
    return this.reportsService.dashboard(query);
  }
}
