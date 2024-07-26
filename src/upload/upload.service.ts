import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { storage, ref, uploadBytes, getDownloadURL } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
@Injectable()
export class UploadService {
    async uploadFile(file: Express.Multer.File): Promise<string> {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new InternalServerErrorException('Tipo de archivo no válido');
        }
        try {
            const uniqueName = `${uuidv4()}-${file.originalname}`;
            const storageRef = ref(storage, `uploads/${uniqueName}`);
            await uploadBytes(storageRef, file.buffer);
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            console.error('Error al subir el archivo a Firebase Storage:', error.message);
            throw new InternalServerErrorException('Error al subir el archivo');
        }
    }
}
