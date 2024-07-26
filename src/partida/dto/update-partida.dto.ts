import { PartialType } from '@nestjs/swagger';
import { CreatePartidaDto } from './create-partida.dto';

export class UpdatePartidaDto extends PartialType(CreatePartidaDto) {}
