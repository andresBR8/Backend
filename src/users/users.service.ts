import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { NotificationsService } from '../notificaciones/notificaciones.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, 
    private notificationsService: NotificationsService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByResetToken(resetToken: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        resetToken,
      },
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    
    
    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    const { username, email, password, name, role } = createUserDto;

    const existingUserByUsername = await this.prisma.user.findUnique({ where: { username } });
    if (existingUserByUsername) {
      throw new BadRequestException('El nombre de usuario ya está en uso.');
    }

    const existingUserByEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      throw new BadRequestException('El correo electrónico ya está en uso.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    
  }

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    
    return user;
  }
}
