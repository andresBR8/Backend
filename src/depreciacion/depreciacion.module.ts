import { Module } from '@nestjs/common';
import { DepreciacionService } from './depreciacion.service';
import { DepreciacionController } from './depreciacion.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DepreciacionController],
  providers: [DepreciacionService, PrismaService],
})
export class DepreciacionModule {}
