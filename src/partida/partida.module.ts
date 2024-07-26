import { Module } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { PartidaController } from './partida.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PartidaController],
  providers: [PartidaService, PrismaService],
})
export class PartidaModule {}
