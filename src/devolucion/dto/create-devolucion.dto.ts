import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ActivoUnidadDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  fkActivoUnidad: number;
}

export class CreateDevolucionDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID del personal es obligatorio.' })
  @IsNumber({}, { message: 'El ID del personal debe ser un número.' })
  fkPersonal: number;

  @ApiProperty({ example: 'user-id-123' })
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio.' })
  @IsString({ message: 'El ID de usuario debe ser una cadena de texto.' })
  fkUsuario: string;

  @ApiProperty({ example: '2024-07-15T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de devolución es obligatoria.' })
  @IsDateString(
    {},
    { message: 'La fecha de devolución debe ser una fecha válida.' },
  )
  fecha: string;

  @ApiProperty({ example: 'Devolución de activos del proyecto X' })
  @IsNotEmpty({ message: 'El detalle de la devolución es obligatorio.' })
  @IsString({ message: 'El detalle debe ser una cadena de texto.' })
  detalle: string;

  @ApiProperty({ example: 'http://example.com/actaDevolucion.pdf' })
  @IsNotEmpty({ message: 'El acta de la devolución es obligatoria.' })
  @IsString({
    message:
      'El enlace del acta de devolución debe ser una cadena de texto válida.',
  })
  actaDevolucion: string;

  @ApiProperty({
    example: [{ fkActivoUnidad: 1 }, { fkActivoUnidad: 2 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivoUnidadDto)
  @ArrayNotEmpty({ message: 'Debe devolver al menos un activo.' })
  activosUnidades: ActivoUnidadDto[];
}
