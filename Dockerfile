FROM mhart/alpine-node:latest

COPY package.json /vstsbot/package.json
RUN cd /vstsbot; npm install --production

COPY output /vstsbot

CMD ["node", "/vstsbot/app.js"]