import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reportes.service';

@Controller('reportes')

export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('inventory')
  async getInventoryReport(@Query() filters: any) {
    const data = await this.reportsService.generateInventoryReport(filters);
    return { data };
  }

  @Get('depreciation')
  async getDepreciationReport(@Query() filters: any) {
    const data = await this.reportsService.generateDepreciationReport(filters);
    return { data };
  }

  @Get('maintenance')
  async getMaintenanceReport(@Query() filters: any) {
    const data = await this.reportsService.generateMaintenanceReport(filters);
    return { data };
  }

  @Get('disposal')
  async getDisposalReport(@Query() filters: any) {
    const data = await this.reportsService.generateDisposalReport(filters);
    return { data };
  }

  @Get('assignments')
  async getAssignmentReport(@Query() filters: any) {
    const data = await this.reportsService.generateAssignmentReport(filters);
    return { data };
  }

  @Get('reassignments')
  async getReassignmentReport(@Query() filters: any) {
    const data = await this.reportsService.generateReassignmentReport(filters);
    return { data };
  }

  @Get('assignment-history')
  async getAssignmentHistoryReport(@Query() filters: any) {
    const data = await this.reportsService.generateAssignmentHistoryReport(filters);
    return { data };
  }
}
