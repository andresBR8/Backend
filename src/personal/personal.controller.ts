import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, BadRequestException, NotFoundException, UsePipes, ValidationPipe, Put } from '@nestjs/common';
import { PersonalService } from './personal.service';
import { CreatePersonalDto } from './dto/create-personal.dto';
import { UpdatePersonalDto } from './dto/update-personal.dto';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('personal')
@Controller('personal')
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Crear un nuevo personal' })
  @ApiResponse({ status: 201, description: 'El personal ha sido creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async create(@Body() createPersonalDto: CreatePersonalDto, @Res() res: Response) {
    try {
      const personal = await this.personalService.create(createPersonalDto);
      return res.status(HttpStatus.CREATED).json({
        message: 'Personal creado exitosamente',
        data: personal,
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear el personal: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los personales' })
  @ApiResponse({ status: 200, description: 'Lista de todos los personales' })
  async findAll(@Res() res: Response) {
    const personales = await this.personalService.findAll();
    return res.status(HttpStatus.OK).json({
      message: 'Personales obtenidos exitosamente',
      data: personales,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un personal por ID' })
  @ApiResponse({ status: 200, description: 'El personal' })
  @ApiResponse({ status: 404, description: 'Personal no encontrado' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const personal = await this.personalService.findOne(+id);
    if (!personal) {
      throw new NotFoundException('Personal no encontrado');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Personal obtenido exitosamente',
      data: personal,
    });
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Actualizar un personal' })
  @ApiResponse({ status: 200, description: 'El personal ha sido actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async update(@Param('id') id: string, @Body() updatePersonalDto: UpdatePersonalDto, @Res() res: Response) {
    try {
      const personal = await this.personalService.update(+id, updatePersonalDto);
      return res.status(HttpStatus.OK).json({
        message: 'Personal actualizado exitosamente',
        data: personal,
      });
    } catch (error) {
      throw new BadRequestException(`Error al actualizar el personal: ${error.message}`);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un personal' })
  @ApiResponse({ status: 200, description: 'El personal ha sido eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Personal no encontrado' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const personal = await this.personalService.remove(+id);
      return res.status(HttpStatus.OK).json({
        message: 'Personal eliminado exitosamente',
        data: personal,
      });
    } catch (error) {
      throw new NotFoundException('Error al eliminar el personal');
    }
  }
}
