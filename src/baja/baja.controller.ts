import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, UsePipes, ValidationPipe, Req, BadRequestException, NotFoundException } from '@nestjs/common';
import { BajaService } from './baja.service';
import { CreateBajaDto } from './dto/create-baja.dto';
import { UpdateBajaDto } from './dto/update-baja.dto';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('baja')
@Controller('baja')
export class BajaController {
  constructor(private readonly bajaService: BajaService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Crear una nueva baja' })
  @ApiResponse({ status: 201, description: 'La baja ha sido creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async create(@Body() createBajaDto: CreateBajaDto, @Req() req: Request, @Res() res: Response) {
    try {
      const userId = (req as any).user?.id; // Modifica esto según cómo obtienes el `userId`
      if (!userId) {
        throw new BadRequestException('User ID no encontrado');
      }
      const baja = await this.bajaService.createBaja(createBajaDto, userId);
      return res.status(HttpStatus.CREATED).json({
        message: 'Baja creada exitosamente',
        data: baja,
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear la baja: ${error.message}`);
    }
  }

  @Patch(':id/aprobar')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Aprobar o rechazar una baja' })
  @ApiResponse({ status: 200, description: 'La baja ha sido aprobada o rechazada exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async aprobarBaja(
    @Param('id') id: string,
    @Body() body: { administradorId: string; aprobar: boolean },
    @Res() res: Response
  ) {
    try {
      const baja = await this.bajaService.aprobarBaja(+id, body.administradorId, body.aprobar);
      return res.status(HttpStatus.OK).json({
        message: `Baja ${body.aprobar ? 'aprobada' : 'rechazada'} exitosamente`,
        data: baja,
      });
    } catch (error) {
      throw new BadRequestException(`Error al aprobar/rechazar la baja: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las bajas' })
  @ApiResponse({ status: 200, description: 'Lista de todas las bajas' })
  async findAll(@Res() res: Response) {
    const bajas = await this.bajaService.getBajas();
    return res.status(HttpStatus.OK).json({
      message: 'Bajas obtenidas exitosamente',
      data: bajas,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una baja por ID' })
  @ApiResponse({ status: 200, description: 'La baja' })
  @ApiResponse({ status: 404, description: 'Baja no encontrada' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const baja = await this.bajaService.getBajaById(+id);
    if (!baja) {
      throw new NotFoundException('Baja no encontrada');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Baja obtenida exitosamente',
      data: baja,
    });
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Actualizar una baja' })
  @ApiResponse({ status: 200, description: 'La baja ha sido actualizada exitosamente' })
  async update(@Param('id') id: string, @Body() updateBajaDto: UpdateBajaDto, @Res() res: Response) {
    try {
      const baja = await this.bajaService.updateBaja(+id, updateBajaDto);
      return res.status(HttpStatus.OK).json({
        message: 'Baja actualizada exitosamente',
        data: baja,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `Error al actualizar la baja: ${error.message}`,
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una baja' })
  @ApiResponse({ status: 200, description: 'La baja ha sido eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Baja no encontrada' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const baja = await this.bajaService.deleteBaja(+id);
      return res.status(HttpStatus.OK).json({
        message: 'Baja eliminada exitosamente',
        data: baja,
      });
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: `Error al eliminar la baja: ${error.message}`,
      });
    }
  }
}
