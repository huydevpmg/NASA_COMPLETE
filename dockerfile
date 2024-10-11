FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./
COPY client/package*.json client/
COPY server/package*.json server/

# Install server dependencies
RUN npm install --prefix server --omit=dev

RUN npm install --prefix client 

COPY client/ client/
COPY server/ server/

RUN npm run build --prefix client

USER node

CMD [ "npm", "start", "--prefix", "server" ]

EXPOSE 8000
