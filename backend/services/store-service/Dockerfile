FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Compilar NestJS
RUN npm run build

EXPOSE 3002

CMD ["npm", "run", "start:prod"]
