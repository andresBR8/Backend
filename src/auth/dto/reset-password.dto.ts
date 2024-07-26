import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsNotEmpty({ message: 'El token es obligatorio.' })
    token: string;

    @IsNotEmpty({ message: 'La nueva contraseña es obligatoria.' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    newPassword: string;
}
