// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './infrastructure/http/http-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Prefijo global
  app.setGlobalPrefix('api');

  // ✅ Validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // ✅ Filtro de excepciones global
  app.useGlobalFilters(new HttpExceptionFilter());

  // ✅ CORS para frontend
  app.enableCors({
    origin: [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  // ✅ SWAGGER DOCUMENTATION
  const config = new DocumentBuilder()
    .setTitle('Orchestrator API')
    .setDescription('API Gateway para el comparador de supermercados')
    .setVersion('1.0')
    .addTag('orchestrator')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3006;
  await app.listen(port);
  
  console.log(`🚀 Orchestrator running on: http://localhost:${port}/api`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('❌ Error starting orchestrator', err);
  process.exit(1);
});

