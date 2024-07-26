import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, NotFoundException, UsePipes, ValidationPipe, Res, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'El usuario ha sido creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const user = await this.usersService.createUser(createUserDto);
      return res.status(HttpStatus.CREATED).json({
        message: 'Usuario creado exitosamente',
        data: user,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de todos los usuarios' })
  async findAll(@Res() res: Response) {
    const users = await this.usersService.getUsers();
    return res.status(HttpStatus.OK).json({
      message: 'Usuarios obtenidos exitosamente',
      data: users,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: 200, description: 'El usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const user = await this.usersService.getUserById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Usuario obtenido exitosamente',
      data: user,
    });
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({ status: 200, description: 'El usuario ha sido actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Res() res: Response) {
    try {
      const user = await this.usersService.updateUser(id, updateUserDto);
      return res.status(HttpStatus.OK).json({
        message: 'Usuario actualizado exitosamente',
        data: user,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiResponse({ status: 200, description: 'El usuario ha sido eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.usersService.deleteUser(id);
      return res.status(HttpStatus.OK).json({
        message: 'Usuario eliminado exitosamente',
        data: user,
      });
    } catch (error) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
