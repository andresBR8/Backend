import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PruebaNestService } from './prueba_nest.service';
import { CreatePruebaNestDto } from './dto/create-prueba_nest.dto';
import { UpdatePruebaNestDto } from './dto/update-prueba_nest.dto';

@Controller('prueba-nest')
export class PruebaNestController {
  constructor(private readonly pruebaNestService: PruebaNestService) {}

  @Post()
  create(@Body() createPruebaNestDto: CreatePruebaNestDto) {
    return this.pruebaNestService.create(createPruebaNestDto);
  }

  @Get()
  findAll() {
    return this.pruebaNestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pruebaNestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePruebaNestDto: UpdatePruebaNestDto) {
    return this.pruebaNestService.update(+id, updatePruebaNestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pruebaNestService.remove(+id);
  }
}
