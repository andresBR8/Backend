import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateAsignacionActivoUnidadDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  fkAsignacion: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  fkActivoUnidad: number;
}
