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

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3002
CMD ["node", "dist/main.js"]
