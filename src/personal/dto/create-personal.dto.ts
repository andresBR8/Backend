import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePersonalDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @IsString()
  ci: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  fkCargo: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  fkUnidad: number;
}
