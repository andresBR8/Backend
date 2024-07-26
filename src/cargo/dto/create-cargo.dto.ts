import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCargoDto {
  @ApiProperty({ example: 'Manager' })
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
