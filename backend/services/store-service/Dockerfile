# ---------- Etapa de compilación ----------
FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Copiar archivos de dependencias
COPY services/store-service/package*.json ./

# Instalar dependencias completas (incluye TypeScript)
RUN npm install

# Copiar el código fuente del servicio
COPY services/store-service/ .

# Generar Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Compilar TypeScript usando el script del package.json
RUN npm run build

# ---------- Etapa final ----------
FROM node:18-alpine

WORKDIR /app
RUN apk add --no-cache openssl

# Copiar los archivos necesarios desde el builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Generar Prisma Client (opcional si ya fue generado arriba)
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copiar los archivos OpenAPI
COPY docs /app/docs

EXPOSE 3001
CMD ["node", "dist/main.js"]
