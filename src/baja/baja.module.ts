import { Module } from '@nestjs/common';
import { BajaService } from './baja.service';
import { BajaController } from './baja.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BajaController],
  providers: [BajaService, PrismaService],
})
export class BajaModule {}
