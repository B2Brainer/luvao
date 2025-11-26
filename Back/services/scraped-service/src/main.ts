// /main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SearchedHttpModule } from './interface/http/scraped-http.module';

async function bootstrap() {
  const app = await NestFactory.create(SearchedHttpModule);

  // Configuración de validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Searched Products Service API')
    .setDescription('API para la gestión de productos scrapeados del comparador de supermercados')
    .setVersion('1.0.0')
    .addTag('Searched Products')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('docs', app, document, {
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
    ],
  });

  // Configuración del puerto - 3005
  const port = process.env.PORT || 3005;
  await app.listen(port);
  
  console.log(`Searched products service running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('Error starting searched products service', err);
  process.exit(1);
});
