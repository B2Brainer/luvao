# ---------- Etapa de compilación ----------
FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Copiar package.json del servicio
COPY services/store-service/package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm install

# Instalar TypeScript globalmente para asegurar que tsc esté disponible
RUN npm install -g typescript

# Copiar el código fuente del servicio
COPY services/store-service/ .

RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npx tsc

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