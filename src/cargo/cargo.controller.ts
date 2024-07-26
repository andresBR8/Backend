import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, NotFoundException } from '@nestjs/common';
import { CargoService } from './cargo.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('cargos')
@Controller('cargos')
export class CargoController {
  constructor(private readonly cargoService: CargoService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new cargo' })
  @ApiResponse({ status: 201, description: 'The cargo has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createCargoDto: CreateCargoDto) {
    return this.cargoService.create(createCargoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cargos' })
  @ApiResponse({ status: 200, description: 'Return all cargos.' })
  findAll() {
    return this.cargoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cargo by ID' })
  @ApiResponse({ status: 200, description: 'Return a cargo.' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id') id: string) {
    return this.cargoService.findOne(+id).catch((error) => {
      throw new NotFoundException(error.message);
    });
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update a cargo by ID' })
  @ApiResponse({ status: 200, description: 'The cargo has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  update(@Param('id') id: string, @Body() updateCargoDto: UpdateCargoDto) {
    return this.cargoService.update(+id, updateCargoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cargo by ID' })
  @ApiResponse({ status: 200, description: 'The cargo has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  remove(@Param('id') id: string) {
    return this.cargoService.remove(+id);
  }
}
