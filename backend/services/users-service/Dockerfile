
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY package-lock.json ./
RUN apk add --no-cache python3 make g++
RUN npm ci --ignore-scripts
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npx prisma generate --schema=src/prisma/schema.prisma || true
RUN npm run build
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist

COPY ./.env ./.env

EXPOSE 3000
CMD ["node", "dist/main.js"]