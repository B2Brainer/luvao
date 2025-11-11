import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { StoresHttpModule } from './interface/stores-http.module';

async function bootstrap() {
  const app = await NestFactory.create(StoresHttpModule);

  // Configuración de validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Stores Service API')
    .setDescription('API para la gestión de tiendas del comparador de supermercados')
    .setVersion('1.0.0')
    .addTag('Stores')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Configuración del puerto
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`Stores service running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/docs`);
}

bootstrap();
