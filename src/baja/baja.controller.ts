import { Controller, Get, Post, Body, Patch, Param, Res, Req, HttpStatus, UsePipes, ValidationPipe, BadRequestException, NotFoundException } from '@nestjs/common';
import { BajaService } from './baja.service';
import { CreateBajaDto } from './dto/create-baja.dto';
import { Request, Response } from 'express';

@Controller('baja')
export class BajaController {
  constructor(private readonly bajaService: BajaService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createBajaDto: CreateBajaDto, @Body('role') role: string, @Res() res: Response) {
    try {
      const baja = await this.bajaService.createBaja(createBajaDto, role);
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
  async aprobarBaja(
    @Param('id') id: string,
    @Body('role') role: string,
    @Body('aprobar') aprobar: boolean,
    @Res() res: Response
  ) {
    try {
      const baja = await this.bajaService.aprobarBaja(+id, role, aprobar);
      return res.status(HttpStatus.OK).json({
        message: `Baja ${aprobar ? 'aprobada' : 'rechazada'} exitosamente`,
        data: baja,
      });
    } catch (error) {
      throw new BadRequestException(`Error al aprobar/rechazar la baja: ${error.message}`);
    }
  }

  @Get()
  async findAll(@Res() res: Response) {
    const bajas = await this.bajaService.getBajas();
    return res.status(HttpStatus.OK).json({
      message: 'Bajas obtenidas exitosamente',
      data: bajas,
    });
  }

  @Get(':id')
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
}
