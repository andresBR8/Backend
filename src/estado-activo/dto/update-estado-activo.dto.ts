import { PartialType } from '@nestjs/swagger';
import { CreateEstadoActivoDto } from './create-estado-activo.dto';

export class UpdateEstadoActivoDto extends PartialType(CreateEstadoActivoDto) {}
