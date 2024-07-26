import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Partida, Prisma } from '@prisma/client';

@Injectable()
export class PartidaService {
  constructor(private prisma: PrismaService) {}

  async createPartida(data: Prisma.PartidaCreateInput): Promise<Partida> {
    try {
      return await this.prisma.partida.create({
        data,
      });
    } catch (error) {
      throw new BadRequestException(`Error creating partida: ${error.message}`);
    }
  }

  async getPartidas(): Promise<Partida[]> {
    return this.prisma.partida.findMany();
  }

  async getPartidaById(id: number): Promise<Partida | null> {
    const partida = await this.prisma.partida.findUnique({
      where: { id },
    });
    if (!partida) {
      throw new NotFoundException(`Partida with ID ${id} not found`);
    }
    return partida;
  }

  async updatePartida(id: number, data: Prisma.PartidaUpdateInput): Promise<Partida> {
    try {
      return await this.prisma.partida.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException(`Error updating partida: ${error.message}`);
    }
  }

  async deletePartida(id: number): Promise<Partida> {
    try {
      return await this.prisma.partida.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Partida with ID ${id} not found`);
    }
  }
}
