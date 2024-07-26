import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUnidadDto {
  @ApiProperty({ example: 'IT Department' })
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
