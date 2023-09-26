FROM node:20.7-buster
WORKDIR /app
RUN wget https://dist.ipfs.tech/kubo/v0.22.0/kubo_v0.22.0_linux-amd64.tar.gz
RUN tar -xvzf kubo_v0.22.0_linux-amd64.tar.gz
RUN cd kubo
#RUN bash install.sh
#RUN ipfs init
#RUN ipfs daemon

# get working with macos
RUN curl -s "https://get.kamu.dev" | sh
RUN ln -s /root/.local/bin/kamu /usr/local/bin/kamu
COPY package.json .

RUN npm install

EXPOSE 3000

ENV ADDRESS=0.0.0.0 PORT=3000

CMD ["npm", "run", "start"]
