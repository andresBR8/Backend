import { Controller, Get, Post, Res, HttpStatus, UseInterceptors, UploadedFile, BadRequestException, Patch, Param, NotFoundException } from '@nestjs/common';
import { PersonalService } from './personal.service';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('personal')
@Controller('personal')
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  // Endpoint para cargar el archivo CSV
  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Cargar archivo CSV para gestionar personal' })
  @ApiResponse({ status: 201, description: 'El CSV ha sido procesado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en el procesamiento del archivo CSV.' })
  async uploadCSV(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo.');
    }

    try {
      const resumen = await this.personalService.processCSV(file);
      return res.status(HttpStatus.CREATED).json({
        message: 'CSV procesado exitosamente',
        resumen,
      });
    } catch (error) {
      throw new BadRequestException(`Error al procesar el CSV: ${error.message}`);
    }
  }

  // Endpoint para obtener la lista de personal
  @Get()
  @ApiOperation({ summary: 'Obtener todos los personales' })
  @ApiResponse({ status: 200, description: 'Lista de todos los personales' })
  async findAll(@Res() res: Response) {
    try {
      const personales = await this.personalService.findAll();
      return res.status(HttpStatus.OK).json({
        message: 'Personales obtenidos exitosamente',
        data: personales,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener los personales: ${error.message}`);
    }
  }
  // Endpoint para inactivar manualmente personal
  @Patch('inactivate/:ci')
  async inactivatePersonal(@Param('ci') ci: string, @Res() res: Response) {
    try {
      await this.personalService.inactivatePersonal(ci);
      return res.status(HttpStatus.OK).json({
        message: `El personal con CI ${ci} fue inactivado correctamente.`,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }
}
