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

  // Crear revisión periódica (por ejemplo, el 20 de diciembre)
  @Post('revision-periodica')
  @ApiOperation({ summary: 'Crear revisión periódica' })
  @ApiResponse({ status: 201, description: 'Revisión periódica creada exitosamente.' })
  async createPeriodicRevision(@Res() res: Response) {
    try {
      await this.personalService.createPeriodicRevision();
      return res.status(HttpStatus.CREATED).json({
        message: 'Revisión periódica creada exitosamente',
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear la revisión periódica: ${error.message}`);
    }
  }

  // Crear revisión sorpresa
  @Post('revision-sorpresa')
  @ApiOperation({ summary: 'Crear revisión sorpresa' })
  @ApiResponse({ status: 201, description: 'Revisión sorpresa creada exitosamente.' })
  async createSurpriseRevision(@Res() res: Response) {
    try {
      await this.personalService.createSurpriseRevision();
      return res.status(HttpStatus.CREATED).json({
        message: 'Revisión sorpresa creada exitosamente',
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear la revisión sorpresa: ${error.message}`);
    }
  }

  // Crear revisión individual
  @Post('revision-individual/:ci/:tipo')
  @ApiOperation({ summary: 'Crear revisión individual (cambio de unidad, vacaciones, culminación de contrato)' })
  @ApiResponse({ status: 201, description: 'Revisión individual creada exitosamente.' })
  async createIndividualRevision(
    @Param('ci') ci: string,
    @Param('tipo') tipo: string,
    @Res() res: Response
  ) {
    try {
      await this.personalService.createIndividualRevision(ci, tipo);
      return res.status(HttpStatus.CREATED).json({
        message: 'Revisión individual creada exitosamente',
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear la revisión individual: ${error.message}`);
    }
  }

  // Finalizar revisión
  @Patch('finalizar-revision/:id')
  @ApiOperation({ summary: 'Finalizar revisión' })
  @ApiResponse({ status: 200, description: 'Revisión finalizada exitosamente.' })
  async finalizeRevision(
    @Param('id') id: number,
    @Res() res: Response,
    @UploadedFile() observaciones: string,
    @UploadedFile() aprobado: boolean
  ) {
    try {
      await this.personalService.finalizeRevision(id, observaciones, aprobado);
      return res.status(HttpStatus.OK).json({
        message: 'Revisión finalizada exitosamente',
      });
    } catch (error) {
      throw new BadRequestException(`Error al finalizar la revisión: ${error.message}`);
    }
  }

  // Generar informe PDF de la revisión
  @Get('reporte-revision/:id')
  @ApiOperation({ summary: 'Generar informe PDF de la revisión' })
  @ApiResponse({ status: 200, description: 'Informe generado exitosamente.' })
  async generateRevisionReport(@Param('id') id: number, @Res() res: Response) {
    try {
      await this.personalService.generateRevisionReport(id);
      return res.status(HttpStatus.OK).json({
        message: 'Informe de revisión generado exitosamente',
      });
    } catch (error) {
      throw new BadRequestException(`Error al generar el informe: ${error.message}`);
    }
  }
}
