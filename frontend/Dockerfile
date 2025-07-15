FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 5174

ENV VITE_API_BASE_URL=http://localhost:3000/api
ENV NODE_ENV=development

CMD ["npm", "run", "dev"]
