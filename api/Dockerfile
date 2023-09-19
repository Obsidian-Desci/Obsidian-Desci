FROM node:20.5.0


WORKDIR /app

RUN curl -s "https://get.kamu.dev" | sh
RUN ln -s /root/.local/bin/kamu /usr/local/bin/kamu
COPY package.json .

RUN npm install

EXPOSE 3000

ENV ADDRESS=0.0.0.0 PORT=3000

CMD ["npm", "run", "start"]