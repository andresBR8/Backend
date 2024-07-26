import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { LoggerMiddleware } from './logger/logger.middleware';
import { AuthMiddleware } from './auth/auth.middleware';
import { PrismaService } from 'src/prisma.service';
import { NotificationsModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [NotificationsModule],
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
  exports: [UsersService],  // Asegúrate de exportar UsersService
})
export class UsersModule {}