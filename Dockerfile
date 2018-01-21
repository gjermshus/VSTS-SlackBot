FROM mhart/alpine-node:latest

WORKDIR /vstsbot
COPY ./output .

CMD ["node", "/vstsbot/app.js"]