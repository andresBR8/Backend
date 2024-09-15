import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { DepreciacionService } from './depreciacion.service';
import { MetodoDepreciacion } from '@prisma/client';

@Controller('depreciacion')
export class DepreciacionController {
  constructor(private readonly depreciacionService: DepreciacionService) {}

  @Get('comparacion')
  async getDepreciationComparison(@Query('años') años: string) {
    if (!años) {
      throw new BadRequestException('Se debe proporcionar uno o más años en la consulta.');
    }

    const parsedAños = años.split(',').map(Number);
    if (parsedAños.some(isNaN)) {
      throw new BadRequestException('Uno o más de los años proporcionados no son válidos.');
    }

    return this.depreciacionService.getDepreciationComparison(parsedAños);
  }

  @Get('metodo')
  async obtenerDepreciacionPorAñoYMetodo(
    @Query('año') año: string,
    @Query('metodo') metodo: string,
  ) {
    const parsedAño = parseInt(año);
    if (isNaN(parsedAño)) {
      throw new BadRequestException('El año proporcionado no es válido.');
    }

    if (!Object.values(MetodoDepreciacion).includes(metodo as MetodoDepreciacion)) {
      throw new BadRequestException('Método de depreciación no válido.');
    }

    return this.depreciacionService.obtenerDepreciacionPorAñoYMetodo(parsedAño, metodo as MetodoDepreciacion);
  }

  @Get('actual')
  async obtenerDepreciacionAñoActual() {
    return this.depreciacionService.obtenerDepreciacionAñoActual();
  }
}