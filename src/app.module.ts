import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HelloController } from './hello/hello.controller';

import { PrismaService } from './prisma.service';
import { NotificationServiceCorreo } from './notificaciones/notificaciones.service.correo';
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { PersonalModule } from './personal/personal.module';
import { CargoModule } from './cargo/cargo.module';
import { UnidadModule } from './unidad/unidad.module';
import { PartidaModule } from './partida/partida.module';
import { ActivoModeloModule } from './activo-modelo/activo-modelo.module';
import { AsignacionModule } from './asignacion/asignacion.module';
import { BajaModule } from './baja/baja.module';
import { DepreciacionModule } from './depreciacion/depreciacion.module';
import { NotificationsModule } from './notificaciones/notificaciones.module';
import { ReasignacionModule } from './reasignacion/reasignacion.module';
import {BackupModule} from './backup/backup.module';
import { EstadoActivoModule } from './estado-activo/estado-activo.module';
import { SeguimientoModule } from './seguimiento/seguimiento.module';
import { DevolucionModule } from './devolucion/devolucion.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer'; // Asegúrate de tener instalado este módulo
import { PruebaNestModule } from './prueba_nest/prueba_nest.module';



@Module({
  imports: [
    MulterModule.register(),
    ConfigModule.forRoot(), // Opcional: ConfigModule si quieres usar .env
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // Tu host de correo
        port: 587, // Puerto (por ejemplo, 587 para SMTP)
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: 'activosfijosuaemi@gmail.com',
          pass: process.env.EMAIL_PASSWORD, // Tu contraseña de correo
        },
      },
    }),
    PersonalModule,
    CargoModule,
    UnidadModule,
    TasksModule,
    ProjectsModule,
    AuthModule,
    UsersModule,
    PersonalModule,
    CargoModule,
    UnidadModule,
    PartidaModule,
    ActivoModeloModule,
    AsignacionModule,
    
    BajaModule,
    DepreciacionModule,
    NotificationsModule,
    ReasignacionModule,
    BackupModule,
    EstadoActivoModule,
    SeguimientoModule,
    DevolucionModule,
    DashboardModule,
    PruebaNestModule,
    
  ],
  controllers: [HelloController, UploadController],
  providers: [
    PrismaService,
    NotificationServiceCorreo,
    UploadService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: PrismaClientExceptionFilter }
  ],
})
export class AppModule {}
