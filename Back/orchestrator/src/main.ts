// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './infrastructure/http/http-exceptions.filter';

const LOCAL_ORIGIN_PATTERNS = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

function parseAllowedOrigins(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesAllowedOrigin(origin: string, allowedOrigins: string[]): boolean {
  if (LOCAL_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))) {
    return true;
  }

  return allowedOrigins.some((allowedOrigin) => {
    if (allowedOrigin === origin) {
      return true;
    }

    if (!allowedOrigin.includes('*')) {
      return false;
    }

    const wildcardPattern = new RegExp(
      `^${escapeRegex(allowedOrigin).replace(/\\\*/g, '.*')}$`,
    );

    return wildcardPattern.test(origin);
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

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
    origin: (origin, callback) => {
      if (!origin || matchesAllowedOrigin(origin, allowedOrigins)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
  console.log(
    `🌐 Allowed CORS origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'localhost only'}`,
  );
}

bootstrap().catch((err) => {
  console.error('❌ Error starting orchestrator', err);
  process.exit(1);
});

