import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { exec } from 'child_process';
import { format } from 'date-fns';
import { storage, ref, uploadBytes, getDownloadURL } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import { NotificationsService } from '../notificaciones/notificaciones.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class BackupService {
  constructor(private notificationsService: NotificationsService) {}

  async createBackup(): Promise<{ backupUrl: string }> {
    const backupName = `backup-${format(new Date(), 'yyyyMMddHHmmss')}.sql`;
    const containerName = 'myfirstapp-db-1';
    const uniqueName = `${uuidv4()}-${backupName}`;

    const backupCommand = `docker exec ${containerName} pg_dump -U andres -d proyectodb -F c -b -v -f /tmp/${backupName}`;

    return new Promise((resolve, reject) => {
      exec(backupCommand, async (error, stdout, stderr) => {
        if (error) {
          
          return reject(new InternalServerErrorException(`Error realizando el backup: ${error.message}`));
        }

        exec(`docker exec ${containerName} cat /tmp/${backupName}`, async (catError, catStdout, catStderr) => {
          if (catError) {
            
            return reject(new InternalServerErrorException(`Error leyendo el archivo de backup: ${catError.message}`));
          }

          try {
            const storageRef = ref(storage, `backups/${uniqueName}`);
            const buffer = Buffer.from(catStdout, 'utf-8');
            await uploadBytes(storageRef, buffer);

            const backupUrl = await getDownloadURL(storageRef);
            
            resolve({ backupUrl });
          } catch (uploadError) {
            
            reject(new InternalServerErrorException(`Error subiendo el archivo de backup a Firebase: ${uploadError.message}`));
          }
        });
      });
    });
  }

  private async sendNotification(subject: string, message: string, roles: string[]) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: true,
      auth: {
        user: 'activosfijosuaemi@gmail.com',
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: 'andrescorani20@gmail.com',
      subject,
      text: message,
    });
  }
}
