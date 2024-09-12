import { Module } from '@nestjs/common';
import { EstadoActivoService } from './estado-activo.service';
import { EstadoActivoController } from './estado-activo.controller';
import { PrismaService } from 'src/prisma.service';
import { NotificationsModule } from 'src/notificaciones/notificaciones.module';

@Module({
  controllers: [EstadoActivoController],
  providers: [EstadoActivoService, PrismaService],
  imports: [NotificationsModule],
})
export class EstadoActivoModule {}
