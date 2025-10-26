# ---------- Etapa de compilación ----------
FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Copiar package.json y lock
COPY services/product-service/package*.json ./

# Instalar TODAS las dependencias (incluyendo las dev)
RUN npm install

# Copiar el código fuente
COPY services/product-service/ .

# Generar Prisma Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Compilar TypeScript
RUN npx tsc
# ---------- Etapa final ----------
# ---------- Etapa final ----------
FROM node:18-alpine

WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

COPY --from=builder /app/dist ./dist
COPY docs /app/docs

EXPOSE 3002
CMD ["node", "dist/main.js"]