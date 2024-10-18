import { PartialType } from '@nestjs/swagger';
import { CreatePruebaNestDto } from './create-prueba_nest.dto';

export class UpdatePruebaNestDto extends PartialType(CreatePruebaNestDto) {}
