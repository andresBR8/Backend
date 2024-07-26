import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';

@Injectable()
export class CargoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCargoDto: CreateCargoDto) {
    try {
      return await this.prisma.cargo.create({
        data: createCargoDto,
      });
    } catch (error) {
      throw new BadRequestException(`Error creating cargo: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.cargo.findMany();
  }

  async findOne(id: number) {
    const cargo = await this.prisma.cargo.findUnique({
      where: { id },
    });
    if (!cargo) {
      throw new NotFoundException(`Cargo with ID ${id} not found`);
    }
    return cargo;
  }

  async update(id: number, updateCargoDto: UpdateCargoDto) {
    try {
      return await this.prisma.cargo.update({
        where: { id },
        data: updateCargoDto,
      });
    } catch (error) {
      throw new BadRequestException(`Error updating cargo: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.cargo.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Cargo with ID ${id} not found`);
    }
  }
}
