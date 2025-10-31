# ---------- Etapa de compilación ----------
FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl

# Manifiestos y Prisma del servicio (rutas relativas a la RAÍZ del repo)
COPY services/user-service/package*.json ./
COPY services/user-service/prisma ./prisma

# Instala TODAS las dependencias (incluye dev, para usar npx prisma en runtime)
RUN npm ci
RUN npx prisma generate --schema=./prisma/schema.prisma

# Código fuente y TS config del servicio
COPY services/user-service/tsconfig*.json ./
COPY services/user-service/src ./src

# Compilar a dist/
RUN npx tsc

# ---------- Etapa final ----------
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copia los docs desde la RAÍZ del repo
COPY docs /app/docs

# 👇 Convertir YAML -> JSON para que main.ts encuentre /app/docs/openapi-user.json
#   - Usa 'yq' del repositorio de Alpine
RUN apk add --no-cache yq && \
    if [ -f /app/docs/openapi-user.yaml ]; then \
      yq -o=json /app/docs/openapi-user.yaml > /app/docs/openapi-user.json ; \
    elif [ -f /app/docs/openapi-user.yml ]; then \
      yq -o=json /app/docs/openapi-user.yml > /app/docs/openapi-user.json ; \
    elif [ -f /app/docs/openapi.yaml ]; then \
      yq -o=json /app/docs/openapi.yaml > /app/docs/openapi-user.json ; \
    fi

ENV PORT=3003
EXPOSE 3003
CMD ["node", "dist/main.js"]