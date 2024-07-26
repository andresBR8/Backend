import { Module } from '@nestjs/common';
import { CargoService } from './cargo.service';
import { CargoController } from './cargo.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CargoController],
  providers: [CargoService, PrismaService],
})
export class CargoModule {}
