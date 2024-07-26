// src/reasignacion/dto/update-reasignacion.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateReasignacionDto } from './create-reasignacion.dto';

export class UpdateReasignacionDto extends PartialType(CreateReasignacionDto) {}
