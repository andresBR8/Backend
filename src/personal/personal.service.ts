import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Personal, Prisma } from '@prisma/client';
import { CreatePersonalDto } from './dto/create-personal.dto';
import { UpdatePersonalDto } from './dto/update-personal.dto';
import { NotificationsService } from '../notificaciones/notificaciones.service';


@Injectable()
export class PersonalService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async create(createPersonalDto: CreatePersonalDto): Promise<Personal> {
    try {
      const personal = await this.prisma.personal.create({
        data: createPersonalDto,
      });
      return personal;
    } catch (error) {
      throw new BadRequestException('Error al crear el personal');
    }
  }

  async findAll(): Promise<Personal[]> {
    return this.prisma.personal.findMany({
      include: { cargo: true, unidad: true },
    });
  }

  async findOne(id: number): Promise<Personal | null> {
    const personal = await this.prisma.personal.findUnique({
      where: { id },
      include: { cargo: true, unidad: true },
    });
    if (!personal) {
      throw new NotFoundException('Personal no encontrado');
    }
    this.notificationsService.sendNotification('personal-changed', personal);
    return personal;
  }

  async update(id: number, updatePersonalDto: UpdatePersonalDto): Promise<Personal> {
    try {
      const personal = await this.prisma.personal.update({
        where: { id },
        data: updatePersonalDto,
      });
      this.notificationsService.sendNotification('personal-changed', personal);
      return personal;
    } catch (error) {
      throw new BadRequestException('Error al actualizar el personal');
    }
  }

  async remove(id: number): Promise<Personal> {
    try {
      const personal = await this.prisma.personal.delete({
        where: { id },
      });
      this.notificationsService.sendNotification('personal-changed', personal);
      return personal;
    } catch (error) {
      throw new NotFoundException('Error al eliminar el personal');
    }
  }
}
