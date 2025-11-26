import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { StoresHttpModule } from './interface/stores-http.module';

async function bootstrap() {
  const app = await NestFactory.create(StoresHttpModule);

  // Pipes globales (mismas configuraciones que el product-service)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Store Service API')
    .setDescription('API para la gestión de tiendas del comparador de supermercados')
    .setVersion('1.0.0')
    .addTag('Stores')
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

  // Puerto
  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Store service running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('Error starting store service', err);
  process.exit(1);
});

