import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { NotificationsModule } from '../notificaciones/notificaciones.module';

@Module({
    imports: [NotificationsModule],
    providers: [BackupService],
    controllers: [BackupController],
})
export class BackupModule {}
