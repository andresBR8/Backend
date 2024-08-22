import { Module } from '@nestjs/common';
import { DepreciacionService } from './depreciacion.service';
import { DepreciacionController } from './depreciacion.controller';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from 'src/notificaciones/notificaciones.module';

@Module({
  controllers: [DepreciacionController],
  providers: [DepreciacionService, PrismaService],
  imports:[NotificationsModule]
})
export class DepreciacionModule {}
