import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateEstadoActivoDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID del activo es obligatorio.' })
  @IsNumber({}, { message: 'El ID del activo debe ser un número.' })
  fkActivoUnidad: number;

  @ApiProperty({ example: 'bueno' })
  @IsNotEmpty({ message: 'El nuevo estado es obligatorio.' })
  @IsString({ message: 'El nuevo estado debe ser una cadena de texto.' })
  estadoNuevo: string;

  @ApiProperty({ example: 'Motivo del cambio de estado' })
  @IsOptional()
  @IsString({ message: 'El motivo del cambio debe ser una cadena de texto.' })
  motivoCambio?: string;
}
