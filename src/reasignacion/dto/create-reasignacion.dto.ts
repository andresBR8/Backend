// src/reasignacion/dto/create-reasignacion.dto.ts
import { IsNotEmpty, IsInt, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReasignacionDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de la unidad de activo es obligatorio.' })
  @IsInt({ message: 'El ID de la unidad de activo debe ser un número entero.' })
  fkActivoUnidad: number;

  @ApiProperty({ example: 'user-id-anterior' })
  @IsNotEmpty({ message: 'El ID del usuario anterior es obligatorio.' })
  @IsString({ message: 'El ID del usuario anterior debe ser una cadena de texto.' })
  fkUsuarioAnterior: string;

  @ApiProperty({ example: 'user-id-nuevo' })
  @IsNotEmpty({ message: 'El ID del usuario nuevo es obligatorio.' })
  @IsString({ message: 'El ID del usuario nuevo debe ser una cadena de texto.' })
  fkUsuarioNuevo: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID del personal anterior es obligatorio.' })
  @IsInt({ message: 'El ID del personal anterior debe ser un número entero.' })
  fkPersonalAnterior: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty({ message: 'El ID del personal nuevo es obligatorio.' })
  @IsInt({ message: 'El ID del personal nuevo debe ser un número entero.' })
  fkPersonalNuevo: number;

  @ApiProperty({ example: 'Reasignación debido a cambio de proyecto' })
  @IsNotEmpty({ message: 'El detalle es obligatorio.' })
  @IsString({ message: 'El detalle debe ser una cadena de texto.' })
  detalle: string;

  @ApiProperty({ example: 'http://example.com/avalReasignacion.pdf' })
  @IsNotEmpty({ message: 'El aval de la reasignación es obligatorio.' })
  avalReasignacion: string;

  
  @ApiProperty({ example: '2024-07-15T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de reasignación es obligatoria.' })
  @IsDateString()
  fechaReasignacion: string;
}
