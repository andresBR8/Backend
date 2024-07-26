import { PartialType } from '@nestjs/swagger';
import { CreateDepreciacionDto } from './create-depreciacion.dto';

export class UpdateDepreciacionDto extends PartialType(CreateDepreciacionDto) {}
