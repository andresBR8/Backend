import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { BajaEstado } from '@prisma/client';

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

  @ApiProperty({ example: 'PENDIENTE', enum: BajaEstado, required: false })
  @IsOptional()
  @IsEnum(BajaEstado)
  estado?: BajaEstado;
}
