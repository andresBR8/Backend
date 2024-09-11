import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';

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

  // Habilitar CORS
  app.enableCors();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
/*
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';

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

  // Agregar cabeceras de seguridad
  app.use((req, res, next) => {
    // Cabecera para forzar HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Cabecera para evitar ataques de clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Cabecera para evitar ataques de MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Política de seguridad de contenido para evitar XSS y otros ataques
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'");
    
    next();
  });

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Activos API')
    .setDescription('API para gestionar activos y partidas')
    .setVersion('1.0')
    .addTag('activos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Habilitar CORS
  app.enableCors();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

*/