import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // 👈 importa el ValidationPipe
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // habilita validaciones de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // elimina propiedades no definidas en DTO
      forbidNonWhitelisted: true, // lanza error si llegan propiedades extra
      transform: true,            // transforma payloads a instancias de DTO
    }),
  );

  // lee puerto desde .env o usa 3000 por defecto
  const port = process.env.PORT || 3000;

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Users Service API')
    .setDescription('Documentación de la API para el microservicio de usuarios')
    .setVersion('1.0')
    .addTag('users') // agrupa los endpoints bajo "users"
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // docs disponibles en /api

  await app.listen(port);
  console.log(`🚀 Users service running on http://0.0.0.0:${port}`);
  console.log(`📖 Swagger docs available on http://0.0.0.0:${port}/api`);
}

bootstrap();
