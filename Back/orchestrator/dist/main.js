"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exceptions_filter_1 = require("./infrastructure/http/http-exceptions.filter");
const LOCAL_ORIGIN_PATTERNS = [
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
];
function parseAllowedOrigins(value) {
    if (!value) {
        return [];
    }
    return value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function matchesAllowedOrigin(origin, allowedOrigins) {
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
        const wildcardPattern = new RegExp(`^${escapeRegex(allowedOrigin).replace(/\\\*/g, '.*')}$`);
        return wildcardPattern.test(origin);
    });
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exceptions_filter_1.HttpExceptionFilter());
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
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Orchestrator API')
        .setDescription('API Gateway para el comparador de supermercados')
        .setVersion('1.0')
        .addTag('orchestrator')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3006;
    await app.listen(port);
    console.log(`🚀 Orchestrator running on: http://localhost:${port}/api`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    console.log(`🌐 Allowed CORS origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'localhost only'}`);
}
bootstrap().catch((err) => {
    console.error('❌ Error starting orchestrator', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map