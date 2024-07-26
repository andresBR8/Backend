import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePartidaDto {
  @ApiProperty({ example: '43100' })
  @IsNotEmpty()
  @IsString()
  codigoPartida: string;

  @ApiProperty({ example: 'Muebles y Equipos de Oficina' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  vidaUtil: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  porcentajeDepreciacion: number;
}
