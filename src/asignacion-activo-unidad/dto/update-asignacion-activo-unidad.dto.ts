import { PartialType } from '@nestjs/swagger';
import { CreateAsignacionActivoUnidadDto } from './create-asignacion-activo-unidad.dto';

export class UpdateAsignacionActivoUnidadDto extends PartialType(CreateAsignacionActivoUnidadDto) {}
