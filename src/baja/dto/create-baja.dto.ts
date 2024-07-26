import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateBajaDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  fkActivoUnidad: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @ApiProperty({ example: 'Motivo de la baja' })
  @IsNotEmpty()
  @IsString()
  motivo: string;
}
