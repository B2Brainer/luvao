
# ---------- deps ----------
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
# instala EXACTAMENTE lo del lockfile y con dev deps
RUN npm ci

# ---------- builder ----------
FROM deps AS builder
WORKDIR /app
COPY . .
# si usas prisma client, generarlo en build
RUN npx prisma generate || true
RUN npm run build

# ---------- runner ----------
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# solo deps de producción para imagen liviana
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
# artefactos
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY ./.env ./.env
EXPOSE 3000
# en runtime NO uses nest cli; arranca el JS compilado
CMD ["node", "dist/main.js"]