# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

ENV TZ UTC
ENV NODE_ENV production
ENV APP_TIMEZONE America/Sao_Paulo

CMD [ "npm", "run", "dev" ]