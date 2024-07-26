import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateActivoModeloDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  fkPartida: number;

  @ApiProperty({ example: 'Laptop' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Laptop Dell XPS 13' })
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  fechaIngreso: string;

  @ApiProperty({ example: 1500.00 })
  @IsNotEmpty()
  @IsNumber()
  costo: number;

  @ApiProperty({ example: 'nuevo' })
  @IsNotEmpty()
  @IsString()
  estado: string;

  @ApiProperty({ example: 'L123' })
  @IsOptional()
  @IsString()
  codigoAnterior?: string;

  @ApiProperty({ example: 'L124' })
  @IsNotEmpty()
  @IsString()
  codigoNuevo: string;

  @ApiProperty({ example: 'http://example.com/orden-compra.pdf' })
  @IsOptional()
  @IsString()
  ordenCompra?: string;

  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  createdBy: string;

  @ApiProperty({ example: 'admin' })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  cantidad: number;
}
