import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // 👈 importa el ValidationPipe
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            
      forbidNonWhitelisted: true, 
      transform: true,            
    }),
  );


  const port = process.env.PORT || 3000;


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
