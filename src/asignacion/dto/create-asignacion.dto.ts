import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsDateString, IsArray, Min } from 'class-validator';

export class CreateAsignacionDto {
  @ApiProperty({ example: 'user-id-123' })
  @IsNotEmpty()
  @IsString()
  fkUsuario: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  fkPersonal: number;

  @ApiProperty({ example: '2024-07-15T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  fechaAsignacion: string;

  @ApiProperty({ example: 'Asignación de activos para el proyecto Y' })
  @IsNotEmpty()
  @IsString()
  detalle: string;

  @ApiProperty({ example: [{ activoModeloId: 1, cantidad: 2 }] })
  @IsArray()
  @IsNotEmpty()
  activosUnidades: { activoModeloId: number, unidades: number[] }[];
}
