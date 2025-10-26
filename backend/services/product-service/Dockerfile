# ---------- Etapa de compilación ----------
FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Copiar solo los archivos de dependencias
COPY services/product-service/package*.json ./

# Instalar dependencias completas (incluye typescript)
RUN npm install

# Copiar el resto del código fuente
COPY services/product-service/ .

# Generar Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Compilar TypeScript
RUN npm run build

# ---------- Etapa final ----------
FROM node:18-alpine

WORKDIR /app
RUN apk add --no-cache openssl

# Copiar solo lo necesario desde el builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generar Prisma Client (opcional si ya se generó arriba)
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copiar documentación (si aplica)
COPY docs /app/docs

EXPOSE 3002
CMD ["node", "dist/main.js"]
