import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ProductsHttpModule } from './interface/http/products-http.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductsHttpModule);

  // Configuración de validación global - MEJORADA
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CONFIGURACIÓN DE SWAGGER - VERSIÓN CORREGIDA (igual a stores-service)
  const config = new DocumentBuilder()
    .setTitle('Product Service API')
    .setDescription('API para la gestión de productos del comparador de supermercados')
    .setVersion('1.0.0')
    .addTag('Products')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // CONFIGURACIÓN IDÉNTICA A STORES-SERVICE
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
  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  console.log(`Product service running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('Error starting product service', err);
  process.exit(1);
});
