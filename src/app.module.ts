import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HelloController } from './hello/hello.controller';

import { PrismaService } from './prisma.service';
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




@Module({
  imports: [
    MulterModule.register(),
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
    
  ],
  controllers: [HelloController, UploadController],
  providers: [
    PrismaService,
    UploadService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: PrismaClientExceptionFilter }
  ],
})
export class AppModule {}
