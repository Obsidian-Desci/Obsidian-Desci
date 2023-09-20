FROM node:20.5.0


WORKDIR /app

# solve cmake not found error
RUN apt-get update && apt-get -y install cmake protobuf-compiler

# get working with macos
RUN arch -arch x86_64 curl -s "https://get.kamu.dev" | sh
RUN ln -s /root/.local/bin/kamu /usr/local/bin/kamu
COPY package.json .

RUN npm install

EXPOSE 3000

ENV ADDRESS=0.0.0.0 PORT=3000

CMD ["npm", "run", "start"]
