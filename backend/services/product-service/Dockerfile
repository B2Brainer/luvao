# ---------- Etapa de compilación ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Instalamos OpenSSL (soluciona el warning)
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- Etapa final ----------
FROM node:18-alpine

WORKDIR /app

# Instalamos OpenSSL también aquí 👇
RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3002
CMD ["node", "dist/main.js"]
