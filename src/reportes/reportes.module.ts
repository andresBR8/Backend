import { Module } from '@nestjs/common';
import { ReportService } from './reportes.service';
import { ReportController } from './reportes.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ReportController],
  providers: [ReportService,PrismaService],
})
export class ReportesModule {}
