import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';
import { MetodoDepreciacion } from '@prisma/client';

export class CreateDepreciacionDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  fkActivoUnidad: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @ApiProperty({ example: 1000.00 })
  @IsNotEmpty()
  @IsNumber()
  valor: number;

  @ApiProperty({ example: 'ANUAL' })
  @IsNotEmpty()
  @IsString()
  periodo: string;

  @ApiProperty({ example: 'LINEA_RECTA' })
  @IsEnum(MetodoDepreciacion)
  @IsNotEmpty()
  metodo: MetodoDepreciacion;

  @ApiProperty({ example: 'Reevaluación' })
  @IsString()
  causaEspecial?: string;
}
