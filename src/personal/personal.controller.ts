import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Res,
  Body,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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

  
  // Endpoint para obtener la lista de personal
  @Get('activos')
@ApiOperation({ summary: 'Obtener solo el personal activo' })
@ApiResponse({ status: 200, description: 'Lista de personal activo' })
async findAllActive(@Res() res: Response) {
  try {
    const personales = await this.personalService.findAllActive();
    return res.status(HttpStatus.OK).json({
      message: 'Personales activos obtenidos exitosamente',
      data: personales,
    });
  } catch (error) {
    throw new BadRequestException(`Error al obtener el personal activo: ${error.message}`);
  }
}


  // Endpoint para obtener la lista de revisiones
  @Get('revisiones')
  @ApiOperation({ summary: 'Obtener todas las revisiones' })
  @ApiResponse({ status: 200, description: 'Lista de todas las revisiones' })
  async findRevisiones(@Res() res: Response) {
    try {
      const revisiones = await this.personalService.findAllRevisiones();
      return res.status(HttpStatus.OK).json({
        message: 'Revisiones obtenidas exitosamente',
        data: revisiones,
      });
    } catch (error) {
      throw new BadRequestException(`Error obteniendo revisiones: ${error.message}`);
    }
  }

  // Endpoint para inactivar manualmente personal
  @Patch('inactivate/:ci')
  @ApiOperation({ summary: 'Inactivar personal' })
  @ApiResponse({ status: 200, description: 'Personal inactivado correctamente.' })
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

  @Post('revision-periodica')
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

  @Post('revision-sorpresa')
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

  @Post('revision-individual/:ci/:tipo')
  async createIndividualRevision(@Param('ci') ci: string, @Param('tipo') tipo: string, @Res() res: Response) {
    try {
      await this.personalService.createIndividualRevision(ci, tipo);
      return res.status(HttpStatus.CREATED).json({
        message: 'Revisión individual creada exitosamente',
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear la revisión individual: ${error.message}`);
    }
  }

  @Patch('revision/:revisionId/persona/:personaId')
  async evaluarPersona(
    @Param('revisionId') revisionId: number,
    @Param('personaId') personaId: number,
    @Body('observaciones') observaciones: string,
    @Body('aprobado') aprobado: boolean,
    @Res() res: Response
  ) {
    try {
      await this.personalService.evaluarPersonaEnRevision(revisionId, personaId, observaciones, aprobado);
      return res.status(HttpStatus.OK).json({
        message: 'Evaluación de personal actualizada exitosamente',
      });
    } catch (error) {
      throw new BadRequestException(`Error al evaluar al personal: ${error.message}`);
    }
  }

  @Patch('finalizar-revision/:id')
  async finalizeRevision(@Param('id') id: number, @Body('observaciones') observaciones: string, @Body('aprobado') aprobado: boolean, @Res() res: Response) {
    try {
      await this.personalService.finalizeRevision(id, observaciones, aprobado);
      return res.status(HttpStatus.OK).json({
        message: 'Revisión finalizada exitosamente',
      });
    } catch (error) {
      throw new BadRequestException(`Error al finalizar la revisión: ${error.message}`);
    }
  }

  @Get('reporte-revision/:id')
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

  @Get('revision/:revisionId/personas')
  async getPersonasByRevision(@Param('revisionId') revisionId: number, @Res() res: Response) {
    try {
      const personas = await this.personalService.getPersonasByRevision(revisionId);
      return res.status(HttpStatus.OK).json({
        message: 'Personal relacionado con la revisión obtenido exitosamente',
        data: personas,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener el personal de la revisión: ${error.message}`);
    }
  }
}
