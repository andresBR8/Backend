import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsDateString, IsArray, Min, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class ActivoUnidadDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  activoModeloId: number;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  unidades: number[];
}

export class CreateAsignacionDto {
  @ApiProperty({ example: 'user-id-123' })
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio.' })
  @IsString({ message: 'El ID de usuario debe ser una cadena de texto.' })
  fkUsuario: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'El ID de personal es obligatorio.' })
  @IsNumber({}, { message: 'El ID de personal debe ser un número.' })
  fkPersonal: number;

  @ApiProperty({ example: '2024-07-15T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de asignación es obligatoria.' })
  @IsDateString({}, { message: 'La fecha de asignación debe ser una fecha válida.' })
  fechaAsignacion: string;

  @ApiProperty({ example: 'Asignación de activos para el proyecto Y' })
  @IsNotEmpty({ message: 'El detalle de la asignación es obligatorio.' })
  @IsString({ message: 'El detalle debe ser una cadena de texto.' })
  detalle: string;

  @ApiProperty({ example: 'http://example.com/avalAsignacion.pdf' })
  @IsNotEmpty({ message: 'El aval de la asignación es obligatorio.' })
  avalAsignacion: string;

  @ApiProperty({
    example: [{ activoModeloId: 1, unidades: [1, 2, 3] }]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivoUnidadDto)
  @ArrayNotEmpty({ message: 'Debe asignar al menos un activo.' })
  activosUnidades: ActivoUnidadDto[];
}
