import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty({ message: 'El nombre de usuario es obligatorio.' })
    @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
    username: string;

    @IsEmail({}, { message: 'Debe ser un correo electrónico válido.' })
    email: string;

    @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    password: string;

    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    name: string;

    @IsNotEmpty({ message: 'El rol es obligatorio.' })
    @IsString({ message: 'El rol debe ser una cadena de texto.' })
    role: string;
}
