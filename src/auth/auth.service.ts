import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { addHours } from 'date-fns';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findUserByUsername(username);
        if (!user) {
            throw new UnauthorizedException('Nombre de usuario no encontrado.');
        }

        if (!(await bcrypt.compare(pass, user.password))) {
            throw new UnauthorizedException('Contraseña incorrecta.');
        }

        const { password, ...result } = user;
        return result;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id:user.id,
                name: user.name,
                role: user.role,
                email: user.email,
            }
        }    
    };

    async sendEmail(destinatario: string, asunto: string, cuerpo: string) {
        try {
            const mailOptions = {
                from: 'tu-correo@gmail.com',
                to: destinatario,
                subject: asunto,
                text: cuerpo,
            };

            await this.transporter.sendMail(mailOptions);
            console.log('Correo enviado correctamente.');
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            throw new InternalServerErrorException('Error al enviar el correo.');
        }
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.usersService.findByResetToken(token);
        if (!user || user.resetTokenExpiration < new Date()) {
            throw new BadRequestException('Token de restablecimiento inválido o expirado.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.usersService.updateUser(user.id, {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiration: null,
        });

        return { message: 'La contraseña ha sido restablecida correctamente.' };
    }

    private transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'activosfijosuaemi@gmail.com',
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    async requestPasswordReset(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('No se encontró un usuario con ese correo.');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiration = addHours(new Date(), 1);

        await this.usersService.updateUser(user.id, {
            resetToken,
            resetTokenExpiration,
        });

        const resetUrl = `http://your-frontend-url/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: 'your-email@example.com',
            to: user.email,
            subject: 'Restablecimiento de contraseña',
            text: `Por favor, use el siguiente enlace para restablecer su contraseña: ${resetUrl}`,
        };

        await this.transporter.sendMail(mailOptions);

        return { message: 'Se ha enviado un correo con instrucciones para restablecer la contraseña.' };
    }
}
