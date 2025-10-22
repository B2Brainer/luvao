# ---------- Etapa de compilación ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Instalamos dependencias del sistema necesarias
RUN apk add --no-cache openssl

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos todas las dependencias (incluyendo dev)
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Generamos Prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# ✅ Compilamos usando npx (garantizado que funciona)
RUN npx tsc

# ---------- Etapa final ----------
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
