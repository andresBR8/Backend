import { Module } from '@nestjs/common';
import { BajaService } from './baja.service';
import { BajaController } from './baja.controller';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [NotificationsModule],
  controllers: [BajaController],
  providers: [BajaService, PrismaService],
})
export class BajaModule {}
