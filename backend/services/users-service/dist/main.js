"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common"); // 👈 importa el ValidationPipe
require("reflect-metadata");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // habilita validaciones de DTOs con class-validator
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true, // elimina propiedades no definidas en DTO
        forbidNonWhitelisted: true, // lanza error si llegan propiedades extra
        transform: true, // transforma payloads a instancias de DTO
    }));
    // lee puerto desde .env o usa 3000 por defecto
    const port = process.env.PORT || 3000;
    // Configuración de Swagger
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Users Service API')
        .setDescription('Documentación de la API para el microservicio de usuarios')
        .setVersion('1.0')
        .addTag('users') // agrupa los endpoints bajo "users"
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document); // docs disponibles en /api
    await app.listen(port);
    console.log(`🚀 Users service running on http://0.0.0.0:${port}`);
    console.log(`📖 Swagger docs available on http://0.0.0.0:${port}/api`);
}
bootstrap();
