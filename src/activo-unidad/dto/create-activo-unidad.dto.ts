import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateActivoUnidadDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  fkActivoModelo: number;

  @ApiProperty({ example: 'AU-001' })
  @IsNotEmpty()
  @IsString()
  codigo: string;

  @ApiProperty({ example: false })
  @IsNotEmpty()
  asignado: boolean;
}
