import { Module } from '@nestjs/common';
import { ReasignacionService } from './reasignacion.service';
import { ReasignacionController } from './reasignacion.controller';
import { PrismaService } from 'src/prisma.service';
import { NotificationsModule } from 'src/notificaciones/notificaciones.module';

@Module({
  controllers: [ReasignacionController],
  providers: [ReasignacionService, PrismaService],
  imports: [NotificationsModule],
})
export class ReasignacionModule {}
