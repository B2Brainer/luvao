FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3005

CMD ["npm", "start"]