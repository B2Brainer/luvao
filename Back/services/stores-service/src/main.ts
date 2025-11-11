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

  // CONFIGURACIÓN DE SWAGGER - VERSIÓN CORREGIDA
const config = new DocumentBuilder()
  .setTitle('Stores Service API')
  .setDescription('API para la gestión de tiendas del comparador de supermercados')
  .setVersion('1.0.0')
  .addTag('Stores')
  .build();

const document = SwaggerModule.createDocument(app, config);
// CAMBIA ESTA LÍNEA:
SwaggerModule.setup('docs', app, document, {
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js',
  ],
  customCssUrl: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
  ],
});

  // Configuración del puerto
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`Stores service running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/docs`);
}

bootstrap();
