import { PartialType } from '@nestjs/swagger';
import { CreateBajaDto } from './create-baja.dto';

export class UpdateBajaDto extends PartialType(CreateBajaDto) {}
