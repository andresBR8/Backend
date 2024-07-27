import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DepreciarPorModeloDto {
  @IsNotEmpty()
  @IsNumber()
  fkActivoModelo: number;

  @IsNotEmpty()
  @IsString()
  fecha: string;

  @IsNotEmpty()
  @IsNumber()
  valor: number;
}
