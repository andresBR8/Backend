// src/reasignacion/dto/create-reasignacion.dto.ts
import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateReasignacionDto {
  @IsNotEmpty()
  @IsInt()
  fkActivoUnidad: number;

  @IsNotEmpty()
  @IsString()
  fkUsuarioAnterior: string;

  @IsNotEmpty()
  @IsString()
  fkUsuarioNuevo: string;

  @IsNotEmpty()
  @IsInt()
  fkPersonalAnterior: number;

  @IsNotEmpty()
  @IsInt()
  fkPersonalNuevo: number;

  @IsNotEmpty()
  @IsString()
  detalle: string;
}
