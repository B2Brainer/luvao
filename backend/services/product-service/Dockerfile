# Imagen base con Node
# 1️⃣ Imagen base con Node.js
FROM node:20

# 2️⃣ Crear directorio de trabajo
WORKDIR /usr/src/app

# 3️⃣ Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# 4️⃣ Copiar el resto del código (incluyendo prisma/)
COPY . .

# 5️⃣ Generar el cliente Prisma dentro del contenedor
RUN npx prisma generate

# 6️⃣ Compilar el proyecto NestJS
RUN npm run build

# 7️⃣ Exponer el puerto del microservicio
EXPOSE 3001

# 8️⃣ Comando para iniciar la app
CMD ["npm", "run", "start:prod"]