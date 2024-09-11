import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  async getKPIs() {
    return this.dashboardService.getKPIs();
  }

  @Get('asset-value-trend')
  async getAssetValueTrend() {
    return this.dashboardService.getAssetValueTrend();
  }

  @Get('asset-distribution')
  async getAssetDistribution() {
    return this.dashboardService.getAssetDistribution();
  }

  @Get('asset-status')
  async getAssetStatus() {
    return this.dashboardService.getAssetStatus();
  }

  @Get('latest-assignments')
  async getLatestAssignments() {
    return this.dashboardService.getLatestAssignments();
  }

  @Get('assets-by-unit')
  async getAssetsByUnit() {
    return this.dashboardService.getAssetsByUnit();
  }

  @Get('high-value-assets')
  async getHighValueAssets() {
    return this.dashboardService.getHighValueAssets();
  }

  @Get('depreciation-comparison')
  async getDepreciationComparison() {
    return this.dashboardService.getDepreciationComparison();
  }

  @Get('upcoming-depreciations')
  async getUpcomingDepreciations() {
    return this.dashboardService.getUpcomingDepreciations();
  }
}
