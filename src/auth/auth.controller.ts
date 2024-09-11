import { Controller, Post, UseGuards, Req, Res, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Request, Response } from 'express';
import { RequestResetDto } from './dto/request-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req: Request, @Res() res: Response) {
        try {
            const result = await this.authService.login(req.user);
            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            if (error instanceof UnauthorizedException) {
                res.status(401).json({ message: 'Nombre de usuario o contraseña incorrectos.' });
            } else {
                res.status(500).json({ message: 'Error interno del servidor.' });
            }
        }
    }

    @Post('request-password-reset')
    async requestPasswordReset(@Body() requestResetDto: RequestResetDto) {
        return this.authService.requestPasswordReset(requestResetDto.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    }
}
