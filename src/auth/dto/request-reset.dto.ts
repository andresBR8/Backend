import { IsNotEmpty, IsEmail } from 'class-validator';

export class RequestResetDto {
    @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
    @IsEmail({}, { message: 'Debe ser un correo electrónico válido.' })
    email: string;
}
