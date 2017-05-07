FROM mhart/alpine-node:latest

RUN npm install -g gulp-cli

COPY . /vstsbotsrc
RUN cd /vstsbotsrc; npm install --production

RUN npm install gulp
WORKDIR /vstsbotsrc

RUN gulp
RUN cp -r /vstsbotsrc/output /vstsbot
RUN rm /vstsbot/config.json
RUN cp -r /vstsbotsrc/node_modules /vstsbot

WORKDIR /vstsbot

RUN rm -rf /vstsbotsrc

CMD ["node", "/vstsbot/app.js"]