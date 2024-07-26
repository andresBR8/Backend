import { Module } from '@nestjs/common';
import { PersonalService } from './personal.service';
import { PersonalController } from './personal.controller';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [NotificationsModule],
  controllers: [PersonalController],
  providers: [PersonalService, PrismaService],
})
export class PersonalModule {}
