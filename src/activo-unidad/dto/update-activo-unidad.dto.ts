import { PartialType } from '@nestjs/swagger';
import { CreateActivoUnidadDto } from './create-activo-unidad.dto';

export class UpdateActivoUnidadDto extends PartialType(CreateActivoUnidadDto) {}
