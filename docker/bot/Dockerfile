FROM node:16

WORKDIR /chat-bot

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY .production.env .production.env
COPY ./dist dist
COPY ./static static


RUN npm ci

ENV NODE_ENV=production

CMD node ./dist/main.js
