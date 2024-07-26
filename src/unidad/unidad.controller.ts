import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, NotFoundException } from '@nestjs/common';
import { UnidadService } from './unidad.service';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('unidades')
@Controller('unidades')
export class UnidadController {
  constructor(private readonly unidadService: UnidadService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new unidad' })
  @ApiResponse({ status: 201, description: 'The unidad has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createUnidadDto: CreateUnidadDto) {
    return this.unidadService.create(createUnidadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all unidades' })
  @ApiResponse({ status: 200, description: 'Return all unidades.' })
  findAll() {
    return this.unidadService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a unidad by ID' })
  @ApiResponse({ status: 200, description: 'Return a unidad.' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id') id: string) {
    return this.unidadService.findOne(+id).catch((error) => {
      throw new NotFoundException(error.message);
    });
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update a unidad by ID' })
  @ApiResponse({ status: 200, description: 'The unidad has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  update(@Param('id') id: string, @Body() updateUnidadDto: UpdateUnidadDto) {
    return this.unidadService.update(+id, updateUnidadDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a unidad by ID' })
  @ApiResponse({ status: 200, description: 'The unidad has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  remove(@Param('id') id: string) {
    return this.unidadService.remove(+id);
  }
}
