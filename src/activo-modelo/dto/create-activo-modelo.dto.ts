import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateActivoModeloDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'La partida es obligatoria.' })
  @IsNumber({}, { message: 'La partida debe ser un número.' })
  fkPartida: number;

  @ApiProperty({ example: 'Laptop' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  nombre: string;

  @ApiProperty({ example: 'Laptop Dell XPS 13' })
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  descripcion: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty({ message: 'La fecha de ingreso es obligatoria.' })
  @IsDateString({}, { message: 'La fecha de ingreso debe ser una fecha válida.' })
  fechaIngreso: string;

  @ApiProperty({ example: 1500.00 })
  @IsNotEmpty({ message: 'El costo es obligatorio.' })
  @IsNumber({}, { message: 'El costo debe ser un número.' })
  @Min(0.01, { message: 'El costo debe ser mayor a 0.' })
  costo: number;

  @ApiProperty({ example: 'nuevo' })
  @IsNotEmpty({ message: 'El estado es obligatorio.' })
  @IsString({ message: 'El estado debe ser una cadena de texto.' })
  estado: string;

  @ApiProperty({ example: 'L123' })
  @IsOptional()
  @IsString({ message: 'El código anterior debe ser una cadena de texto.' })
  codigoAnterior?: string;

  @ApiProperty({ example: 'L124' })
  @IsNotEmpty({ message: 'El código nuevo es obligatorio.' })
  @IsString({ message: 'El código nuevo debe ser una cadena de texto.' })
  codigoNuevo: string;

  @ApiProperty({ example: 'http://example.com/orden-compra.pdf' })
  @IsOptional()
  ordenCompra?: string;

  @ApiProperty({ example: 'admin' })
  @IsNotEmpty({ message: 'El campo creado por es obligatorio.' })
  @IsString({ message: 'El campo creado por debe ser una cadena de texto.' })
  createdBy: string;

  @ApiProperty({ example: 'admin' })
  @IsOptional()
  @IsString({ message: 'El campo actualizado por debe ser una cadena de texto.' })
  updatedBy?: string;

  @ApiProperty({ example: 5 })
  @IsNotEmpty({ message: 'La cantidad es obligatoria.' })
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @Min(1, { message: 'La cantidad debe ser al menos 1.' })
  cantidad: number;
}
