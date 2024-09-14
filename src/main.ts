import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar validaciones globales
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Activos API')
    .setDescription('API para gestionar activos y partidas')
    .setVersion('1.0')
    .addTag('activos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configuración de CORS para permitir producción y desarrollo en cualquier entorno
  const allowedOrigins = [
    'https://activosfijosemi.up.railway.app', // Frontend de producción
    'http://localhost:5173' // Frontend de pruebas
  ];

  app.enableCors({
    origin: allowedOrigins,  // Permitir ambos orígenes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Métodos permitidos
    credentials: true,  // Habilitar envío de credenciales
  });

  // Agregar cabeceras de seguridad
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'");
    next();
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
