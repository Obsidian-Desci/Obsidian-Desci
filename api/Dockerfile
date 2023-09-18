FROM node:20.5.0

WORKDIR /app

COPY package.json .

RUN npm install

EXPOSE 3000

ENV ADDRESS=0.0.0.0 PORT=3000

CMD ["npm", "run", "start"]