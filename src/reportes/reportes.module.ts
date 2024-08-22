import { Module } from '@nestjs/common';
import { ReportsService } from './reportes.service';
import { ReportsController } from './reportes.controller';
import { PrismaService } from 'src/prisma.service';
import { CacheService } from 'src/Cache/cache.service';
import { ReportService } from './reportes.service2';
import { ReportController } from './reportes.controller2';

@Module({
  controllers: [ReportsController,ReportController],
  providers: [ReportsService,PrismaService,CacheService,ReportService],
})
export class ReportesModule {}
