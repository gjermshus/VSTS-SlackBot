FROM mhart/alpine-node:latest

WORKDIR /vstsbot
COPY package.json .
RUN npm install --production

COPY ./output .

CMD ["node", "/vstsbot/app.js"]