import { IsNotEmpty, IsInt, IsString, IsDateString } from 'class-validator';

export class CreateBajaDto {
  @IsNotEmpty()
  @IsInt()
  fkActivoUnidad: number;

  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @IsNotEmpty()
  @IsString()
  motivo: string;

  @IsNotEmpty()
  @IsString()
  role: string; // El rol también puede ser enviado desde el front
}
