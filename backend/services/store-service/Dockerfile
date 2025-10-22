# ---------- Etapa de compilación ----------
FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npx tsc

# ---------- Etapa final ----------
FROM node:18-alpine

WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

# SOLUCIÓN: Generar el cliente de Prisma en la etapa final
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]
