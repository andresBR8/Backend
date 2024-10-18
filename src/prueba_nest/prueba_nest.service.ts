import { Injectable } from '@nestjs/common';
import { CreatePruebaNestDto } from './dto/create-prueba_nest.dto';
import { UpdatePruebaNestDto } from './dto/update-prueba_nest.dto';

@Injectable()
export class PruebaNestService {
  create(createPruebaNestDto: CreatePruebaNestDto) {
    return 'This action adds a new pruebaNest';
  }

  findAll() {
    return `This action returns all pruebaNest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pruebaNest`;
  }

  update(id: number, updatePruebaNestDto: UpdatePruebaNestDto) {
    return `This action updates a #${id} pruebaNest`;
  }

  remove(id: number) {
    return `This action removes a #${id} pruebaNest`;
  }
}
