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
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
          <h1 style="color: white;">Asignación de Activos Realizada</h1>
        </div>
        <div style="padding: 20px;">
          <p>Estimado(a) <strong>${personal.nombre}</strong>,</p>
          <p>Se ha realizado una nueva asignación de activos a su nombre el <strong>${asignacion.fechaAsignacion.toLocaleDateString()}</strong>.</p>
          <p><strong>Detalles de la Asignación:</strong></p>
          <p>${asignacion.detalle}</p>
          <p><a href="${asignacion.avalAsignacion}" style="color: #4CAF50;">Ver Aval de Asignación</a></p>
          <h3>Activos Asignados:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f4f4f4;">
                <th style="border: 1px solid #ddd; padding: 8px;">ID</th>
                <th style="border: 1px solid #ddd; padding: 8px;">EstadoActual</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Código</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${activos.map((activo) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${activo.id}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${activo.estadoActual}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${activo.codigo}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${activo.estadoCondicion}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center;">
          <p style="font-size: 14px; color: #888;">Este es un mensaje automático, no responda a este correo.</p>
        </div>
      </div>`;
    
    await this.sendNotification('Asignación de Activos', htmlTemplate, personal.email);
  }

  // Notificación para Reasignación de Activos
  async sendReasignacionNotification(personalNuevo: any, reasignacion: any, activos: any[]) {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background-color: #6495ED; padding: 20px; text-align: center;">
          <h1 style="color: white;">Reasignación de Activos Realizada</h1>
        </div>
        <div style="padding: 20px;">
          <p>Estimado(a) <strong>${personalNuevo.nombre}</strong>,</p>
          <p>Se ha realizado una reasignación de activos a su nombre el <strong>${reasignacion.fechaReasignacion.toLocaleDateString()}</strong>.</p>
          <p><strong>Detalles de la Reasignación:</strong></p>
          <p>${reasignacion.detalle}</p>
          <p><a href="${reasignacion.avalReasignacion}" style="color: #6495ED;">Ver Aval de Reasignación</a></p>
          <h3>Activos Reasignados:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f4f4f4;">
                <th style="border: 1px solid #ddd; padding: 8px;">ID</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Nombre</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Código</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${activos.map((activo) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${activo.id}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${activo.nombre}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${activo.codigo}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${activo.estadoCondicion}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center;">
          <p style="font-size: 14px; color: #888;">Este es un mensaje automático, no responda a este correo.</p>
        </div>
      </div>`;
    
    await this.sendNotification('Reasignación de Activos', htmlTemplate, personalNuevo.email);
  }

  // Notificación para Devolución de Activos
  async sendDevolucionNotification(personal: any, devolucion: any, activos: any[]) {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background-color: #FFA500; padding: 20px; text-align: center;">
          <h1 style="color: white;">Devolución de Activos Realizada</h1>
        </div>
        <div style="padding: 20px;">
          <p>Estimado(a) <strong>${personal.nombre}</strong>,</p>
          <p>Se ha registrado una devolución de activos a su nombre el <strong>${devolucion.fecha.toLocaleDateString()}</strong>.</p>
          <p><strong>Detalles de la Devolución:</strong></p>
          <p>${devolucion.detalle}</p>
          <p><a href="${devolucion.actaDevolucion}" style="color: #FFA500;">Ver Acta de Devolución</a></p>
          <h3>Activos Devueltos:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f4f4f4;">
                <th style="border: 1px solid #ddd; padding: 8px;">ID</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Nombre</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Código</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${activos.map((activo) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${activo.id}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${activo.nombre}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${activo.codigo}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${activo.estadoCondicion}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center;">
          <p style="font-size: 14px; color: #888;">Este es un mensaje automático, no responda a este correo.</p>
        </div>
      </div>`;
    
    await this.sendNotification('Devolución de Activos', htmlTemplate, personal.email);
  }
}
