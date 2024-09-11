import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { MetodoDepreciacion } from '@prisma/client';

export class CreateDepreciacionDto {
  @ApiProperty({ example: 1, description: 'ID de la unidad de activo a depreciar' })
  @IsNotEmpty()
  @IsNumber()
  fkActivoUnidad: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Fecha de la depreciación en formato ISO' })
  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @ApiProperty({ example: 'LINEA_RECTA', description: 'Método de depreciación utilizado' })
  @IsEnum(MetodoDepreciacion)
  @IsNotEmpty()
  metodo: MetodoDepreciacion;

  @ApiProperty({ example: 'Reevaluación', description: 'Causa especial de la depreciación', required: false })
  @IsOptional()
  @IsString()
  causaEspecial?: string;
}

export class DepreciarTodosDto {
  @ApiProperty({ example: 2024, description: 'Año para el cual se desea realizar la depreciación manual' })
  @IsNotEmpty()
  @IsNumber()
  año: number;
}
