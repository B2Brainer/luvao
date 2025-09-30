# 🏗️ Imagen base (Node 20 con npm)
FROM node:20

# 📂 Crea el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 📦 Copia los archivos de configuración primero (para aprovechar la caché de Docker)
COPY package*.json ./

# 📥 Instala las dependencias
RUN npm install

# 📋 Copia el resto del código fuente
COPY . .

# 🧠 Genera el cliente de Prisma (para que el servicio pueda acceder a la base)
RUN npx prisma generate

# 🔧 Compila el código TypeScript a JavaScript
RUN npm run build

# 🌐 Expone el puerto interno del servicio
EXPOSE 3001

# 🚀 Comando de inicio del contenedor (modo producción)
CMD ["npm", "run", "start"]
