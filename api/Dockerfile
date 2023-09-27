FROM node:20.7-buster
WORKDIR /app
COPY start.sh .
RUN wget https://dist.ipfs.tech/kubo/v0.22.0/kubo_v0.22.0_linux-amd64.tar.gz
RUN tar -xvzf kubo_v0.22.0_linux-amd64.tar.gz
RUN cd kubo && bash install.sh
RUN ipfs init

# get working with macos
#RUN curl -s "https://get.kamu.dev" | sh
#RUN ln -s /root/.local/bin/kamu /usr/local/bin/kamu
COPY package.json .

RUN npm install

EXPOSE 3000
# Swarm TCP; should be exposed to the public
EXPOSE 4001
# Swarm UDP; should be exposed to the public
EXPOSE 4001/udp
# Daemon API; must not be exposed publicly but to client services under you control
EXPOSE 5001
# Web Gateway; can be exposed publicly with a proxy, e.g. as https://ipfs.example.org
EXPOSE 8080
# Swarm Websockets; must be exposed publicly when the node is listening using the websocket transport (/ipX/.../tcp/8081/ws).
EXPOSE 8081

ENV ADDRESS=0.0.0.0 PORT=3000

CMD ["npm", "run", "start"]
