# Imagen base con Node
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json primero (para aprovechar cache de Docker)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código del proyecto
COPY . .

# Compilar TypeScript
RUN npm run build

# Exponer el puerto donde corre NestJS
EXPOSE 3003

# Comando de inicio
CMD ["npm", "run", "start:prod"]