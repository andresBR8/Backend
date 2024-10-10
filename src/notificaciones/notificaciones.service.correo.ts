import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationServiceCorreo {
  constructor(private readonly mailerService: MailerService) {}

  // Método para enviar correos
  private async sendNotification(subject: string, content: string, recipient: string) {
    try {
      await this.mailerService.sendMail({
        to: recipient,
        subject: subject,
        html: content,
      });
      console.log(`Correo enviado a ${recipient}`);
    } catch (error) {
      console.error(`Error al enviar correo: ${error}`);
    }
  }

  // Notificación para Asignación de Activos
  async sendAsignacionNotification(personal: any, asignacion: any, activos: any[]) {
  
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Asignación de Activos</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #054473; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Asignación de Activos Realizada</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="margin-top: 0;">Estimado(a) <strong>${personal.nombre}</strong>,</p>
            <p>Nos complace informarle que se ha realizado una nueva asignación de activos a su nombre el <strong>${asignacion.fechaAsignacion.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
            <div style="background-color: #e8f4ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #054473; margin-top: 0;">Detalles de la Asignación:</h3>
              <p style="margin-bottom: 0;">${asignacion.detalle}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${asignacion.avalAsignacion}" style="display: inline-block; padding: 12px 24px; background-color: #ffba00; color: #054473; text-decoration: none; font-weight: bold; border-radius: 5px; transition: background-color 0.3s;" target="_blank">Descargar Aval de Asignación</a>
            </div>
            <h3 style="color: #054473; margin-top: 40px;">Activos Asignados:</h3>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #054473; color: white;">
                    <th style="padding: 12px; text-align: left;">ID</th>
                    <th style="padding: 12px; text-align: left;">Estado Actual</th>
                    <th style="padding: 12px; text-align: left;">Código</th>
                    <th style="padding: 12px; text-align: left;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${activos.map((activo, index) => `
                    <tr style="background-color: ${index % 2 === 0 ? '#f8f8f8' : 'white'};">
                      <td style="padding: 10px; border-top: 1px solid #ddd;">${activo.id}</td>
                      <td style="padding: 10px; border-top: 1px solid #ddd;">${activo.estadoActual}</td>
                      <td style="padding: 10px; border-top: 1px solid #ddd;">${activo.codigo}</td>
                      <td style="padding: 10px; border-top: 1px solid #ddd;">${activo.estadoCondicion}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 2px solid #054473;">
            <p style="font-size: 14px; color: #888; margin: 0;">Este es un mensaje automático. Por favor, no responda a este correo.</p>
            <p style="font-size: 14px; color: #888; margin: 5px 0 0;">Si tiene alguna pregunta, contacte a soporte técnico.</p>
          </div>
        </div>
      </body>
      </html>`;
    
    await this.sendNotification('Asignación de Activos - Notificación Importante', htmlTemplate, personal.email);
  }



  // Notificación para Reasignación de Activos
  async sendReasignacionNotification(personalNuevo: any, reasignacion: any, activos: any[]) {
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reasignación de Activos</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #6495ED; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Reasignación de Activos Realizada</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="margin-top: 0;">Estimado(a) <strong>${personalNuevo.nombre}</strong>,</p>
            <p>Nos complace informarle que se ha realizado una reasignación de activos a su nombre el <strong>${new Date(reasignacion.fechaReasignacion).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
            <div style="background-color: #e8f4ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #6495ED; margin-top: 0;">Detalles de la Reasignación:</h3>
              <p style="margin-bottom: 0;">${reasignacion.detalle}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reasignacion.avalReasignacion}" style="display: inline-block; padding: 12px 24px; background-color: #6495ED; color: white; text-decoration: none; font-weight: bold; border-radius: 5px; transition: background-color 0.3s;" target="_blank">Descargar Aval de Reasignación</a>
            </div>
            <h3 style="color: #6495ED; margin-top: 40px;">Activos Reasignados:</h3>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #6495ED; color: white;">
                    <th style="padding: 12px; text-align: left;">ID</th>
                    <th style="padding: 12px; text-align: left;">Nombre</th>
                    <th style="padding: 12px; text-align: left;">Código</th>
                    <th style="padding: 12px; text-align: left;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${activos.map((activo, index) => `
                    <tr style="background-color: ${index % 2 === 0 ? '#f8f8f8' : 'white'};">
                      <td style="padding: 10px; border-top: 1px solid #ddd;">${activo.id}</td>
                      <td style="padding: 10px; border-top: 1px solid #ddd;">${activo.activoModelo.nombre}</td>
                      <td style="padding: 10px; border-top: 1px solid #ddd;">${activo.codigo}</td>
                      <td style="padding: 10px; border-top: 1px solid #ddd;">${activo.estadoCondicion}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 2px solid #6495ED;">
            <p style="font-size: 14px; color: #888; margin: 0;">Este es un mensaje automático. Por favor, no responda a este correo.</p>
            <p style="font-size: 14px; color: #888; margin: 5px 0 0;">Si tiene alguna pregunta, contacte a soporte técnico.</p>
          </div>
        </div>
      </body>
      </html>`;
  
    await this.sendNotification('Reasignación de Activos - Notificación Importante', htmlTemplate, personalNuevo.email);
  }
  

  
async sendDevolucionNotification(personal: any, devolucion: any, activos: any[]) {
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Devolución de Activos</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #FFA500; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Devolución de Activos Realizada</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="margin-top: 0;">Estimado(a) <strong>${personal.nombre}</strong>,</p>
            <p>Le informamos que se ha registrado una devolución de activos a su nombre el <strong>${new Date(devolucion.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
            <div style="background-color: #fff5e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #FFA500; margin-top: 0;">Detalles de la Devolución:</h3>
              <p style="margin-bottom: 0;">${devolucion.detalle}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${devolucion.actaDevolucion}" style="display: inline-block; padding: 12px 24px; background-color: #FFA500; color: white; text-decoration: none; font-weight: bold; border-radius: 5px; transition: background-color 0.3s;" target="_blank">Descargar Acta de Devolución</a>
            </div>
            <h3 style="color: #FFA500; margin-top: 40px;">Activos Devueltos:</h3>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #ddd; border-radius: 5px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #FFA500; color: white;">
                    <th style="padding: 12px; text-align: left;">ID</th>
                    <th style="padding: 12px; text-align: left;">Nombre</th>
                    <th style="padding: 12px; text-align: left;">Código</th>
                    <th style="padding: 12px; text-align: left;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${activos.map((activo, index) => `
                    <tr style="background-color: ${index % 2 === 0 ? '#fff8e6' : 'white'};">
                      <td style="padding: 10px; border-top: 1px solid #ddd;">${activo.id}</td>
                      <td style="padding: 10px; border-top: 1px solid #ddd;">${activo.nombre}</td>
                      <td style="padding: 10px; border-top: 1px solid #ddd;">${activo.codigo}</td>
                      <td style="padding: 10px; border-top: 1px solid #ddd;">${activo.estadoCondicion}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 2px solid #FFA500;">
            <p style="font-size: 14px; color: #888; margin: 0;">Este es un mensaje automático. Por favor, no responda a este correo.</p>
            <p style="font-size: 14px; color: #888; margin: 5px 0 0;">Si tiene alguna pregunta, contacte a soporte técnico.</p>
          </div>
        </div>
      </body>
      </html>`;
    
    await this.sendNotification('Devolución de Activos - Notificación Importante', htmlTemplate, personal.email);
  }
  
  
}
