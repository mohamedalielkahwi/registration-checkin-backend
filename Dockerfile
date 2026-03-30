FROM node:18 AS build
WORKDIR /app
#
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
COPY .env.dev .env
RUN npx prisma generate
RUN npx prisma db push --force-reset
RUN npm run seed
RUN npm run build
WORKDIR /app/dist
EXPOSE 80
CMD ["npm","run", "start"]