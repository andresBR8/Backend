import { Controller, Post, Res, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { BackupService } from './backup.service';
import { Response } from 'express';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post()
  async createBackup(@Res() res: Response) {
    try {
      const { backupUrl } = await this.backupService.createBackup();
      return res.status(HttpStatus.OK).json({
        message: 'Backup creado exitosamente',
        backupUrl,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al crear el backup',
        error: error.message,
      });
    }
  }
}
