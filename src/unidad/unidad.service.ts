import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';

@Injectable()
export class UnidadService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUnidadDto: CreateUnidadDto) {
    try {
      return await this.prisma.unidad.create({
        data: createUnidadDto,
      });
    } catch (error) {
      throw new BadRequestException(`Error creating unidad: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.unidad.findMany();
  }

  async findOne(id: number) {
    const unidad = await this.prisma.unidad.findUnique({
      where: { id },
    });
    if (!unidad) {
      throw new NotFoundException(`Unidad with ID ${id} not found`);
    }
    return unidad;
  }

  async update(id: number, updateUnidadDto: UpdateUnidadDto) {
    try {
      return await this.prisma.unidad.update({
        where: { id },
        data: updateUnidadDto,
      });
    } catch (error) {
      throw new BadRequestException(`Error updating unidad: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.unidad.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Unidad with ID ${id} not found`);
    }
  }
}
