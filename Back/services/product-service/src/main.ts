import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ProductsHttpModule } from './interface/http/products-http.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductsHttpModule);

  // Global validation
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Product Service API')
    .setDescription('The product service API description')
    .setVersion('1.0')
    .addTag('products')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  console.log(`Product service listening on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('Error starting product service', err);
  process.exit(1);
});
