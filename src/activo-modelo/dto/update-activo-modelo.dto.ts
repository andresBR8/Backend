import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class UpdateActivoModeloDto {
  @ApiProperty({ example: 'Laptop' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ example: 'Laptop Dell XPS 13' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;

  @ApiProperty({ example: 1500.00 })
  @IsOptional()
  @IsNumber()
  costo?: number;

  @ApiProperty({ example: 'nuevo' })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiProperty({ example: 'L123' })
  @IsOptional()
  @IsString()
  codigoAnterior?: string;

  @ApiProperty({ example: 'L124' })
  @IsOptional()
  @IsString()
  codigoNuevo?: string;

  @ApiProperty({ example: 'http://example.com/orden-compra.pdf' })
  @IsOptional()
  @IsString()
  ordenCompra?: string;

  @ApiProperty({ example: 'admin' })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({ example: 5 })
  @IsOptional()
  @IsNumber()
  cantidad?: number;
}
