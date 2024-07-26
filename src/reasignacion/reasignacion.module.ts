import { Module } from '@nestjs/common';
import { ReasignacionService } from './reasignacion.service';
import { ReasignacionController } from './reasignacion.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ReasignacionController],
  providers: [ReasignacionService, PrismaService],
})
export class ReasignacionModule {}
