FROM node:20.7.0-alpine

WORKDIR /app
COPY package.json .

RUN npm install --omit=dev
COPY . .

CMD ["npm", "run", "start:server"]
