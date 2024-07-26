import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, NotFoundException, BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { CreatePartidaDto } from './dto/create-partida.dto';
import { UpdatePartidaDto } from './dto/update-partida.dto';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('partida')
@Controller('partida')
export class PartidaController {
  constructor(private readonly partidaService: PartidaService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new partida' })
  @ApiResponse({ status: 201, description: 'The partida has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createPartidaDto: CreatePartidaDto, @Res() res: Response) {
    try {
      const data: Prisma.PartidaCreateInput = {
        codigoPartida: createPartidaDto.codigoPartida,
        nombre: createPartidaDto.nombre,
        vidaUtil: createPartidaDto.vidaUtil,
        porcentajeDepreciacion: createPartidaDto.porcentajeDepreciacion,
      };
      const partida = await this.partidaService.createPartida(data);
      return res.status(HttpStatus.CREATED).json({
        message: 'Partida creada exitosamente',
        data: partida,
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear la partida: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all partidas' })
  @ApiResponse({ status: 200, description: 'Return all partidas.' })
  async findAll(@Res() res: Response) {
    const partidas = await this.partidaService.getPartidas();
    return res.status(HttpStatus.OK).json({
      message: 'Partidas obtenidas exitosamente',
      data: partidas,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a partida by ID' })
  @ApiResponse({ status: 200, description: 'Return a partida.' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const partida = await this.partidaService.getPartidaById(+id);
      return res.status(HttpStatus.OK).json({
        message: 'Partida obtenida exitosamente',
        data: partida,
      });
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update a partida by ID' })
  @ApiResponse({ status: 200, description: 'The partida has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async update(@Param('id') id: string, @Body() updatePartidaDto: UpdatePartidaDto, @Res() res: Response) {
    try {
      const data: Prisma.PartidaUpdateInput = {
        codigoPartida: updatePartidaDto.codigoPartida,
        nombre: updatePartidaDto.nombre,
        vidaUtil: updatePartidaDto.vidaUtil,
        porcentajeDepreciacion: updatePartidaDto.porcentajeDepreciacion,
      };
      const partida = await this.partidaService.updatePartida(+id, data);
      return res.status(HttpStatus.OK).json({
        message: 'Partida actualizada exitosamente',
        data: partida,
      });
    } catch (error) {
      throw new BadRequestException(`Error al actualizar la partida: ${error.message}`);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a partida by ID' })
  @ApiResponse({ status: 200, description: 'The partida has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const partida = await this.partidaService.deletePartida(+id);
      return res.status(HttpStatus.OK).json({
        message: 'Partida eliminada exitosamente',
        data: partida,
      });
    } catch (error) {
      throw new NotFoundException(`Error al eliminar la partida: ${error.message}`);
    }
  }
}
