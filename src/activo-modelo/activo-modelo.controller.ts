import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, BadRequestException, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ActivoModeloService } from './activo-modelo.service';
import { CreateActivoModeloDto } from './dto/create-activo-modelo.dto';
import { UpdateActivoModeloDto } from './dto/update-activo-modelo.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('activo-modelo')
@Controller('activo-modelo')
export class ActivoModeloController {
  constructor(private readonly activoModeloService: ActivoModeloService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Crear uno o varios nuevos modelos de activos' })
  @ApiResponse({ status: 201, description: 'Los modelos de activos han sido creados exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async create(@Body() createActivoModeloDtos: CreateActivoModeloDto[]) {
    try {
      if (Array.isArray(createActivoModeloDtos)) {
        await this.activoModeloService.createActivosModelos(createActivoModeloDtos);
      } else {
        await this.activoModeloService.createActivoModelo(createActivoModeloDtos);
      }

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Modelos de activos creados exitosamente',
      };
    } catch (error) {
      throw new BadRequestException(`Error al crear los modelos de activos: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los modelos de activos' })
  @ApiResponse({ status: 200, description: 'Lista de todos los modelos de activos' })
  async findAll() {
    const activosModelos = await this.activoModeloService.getActivosModelos();
    return {
      statusCode: HttpStatus.OK,
      message: 'Modelos de activos obtenidos exitosamente',
      data: activosModelos,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un modelo de activo por ID' })
  @ApiResponse({ status: 200, description: 'El modelo de activo' })
  @ApiResponse({ status: 404, description: 'Modelo de activo no encontrado' })
  async findOne(@Param('id') id: string) {
    const activoModelo = await this.activoModeloService.getActivoModeloById(+id);
    if (!activoModelo) {
      throw new NotFoundException('Modelo de activo no encontrado');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Modelo de activo obtenido exitosamente',
      data: activoModelo,
    };
  }

  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => `${err.property} - ${Object.values(err.constraints).join(', ')}`);
        return new BadRequestException(messages);
      },
    }),
  )
  @ApiOperation({ summary: 'Actualizar un modelo de activo' })
  @ApiResponse({ status: 200, description: 'El modelo de activo ha sido actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async update(@Param('id') id: string, @Body() updateActivoModeloDto: UpdateActivoModeloDto) {
    try {
      await this.activoModeloService.updateActivoModelo(+id, updateActivoModeloDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Modelo de activo actualizado exitosamente',
      };
    } catch (error) {
      throw new BadRequestException(`Error al actualizar el modelo de activo: ${error.message}`);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un modelo de activo' })
  @ApiResponse({ status: 200, description: 'El modelo de activo ha sido eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Modelo de activo no encontrado' })
  async remove(@Param('id') id: string) {
    try {
      await this.activoModeloService.deleteActivoModelo(+id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Modelo de activo eliminado exitosamente',
      };
    } catch (error) {
      throw new BadRequestException(`${error.message}`);
    }
  }
}
