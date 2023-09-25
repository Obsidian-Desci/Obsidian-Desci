FROM node:20.7-buster


WORKDIR /app

# get working with macos
RUN curl -s "https://get.kamu.dev" | sh
RUN ln -s /root/.local/bin/kamu /usr/local/bin/kamu
COPY package.json .

RUN npm install

EXPOSE 3000

ENV ADDRESS=0.0.0.0 PORT=3000

CMD ["npm", "run", "start"]
