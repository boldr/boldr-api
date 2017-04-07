FROM mhart/alpine-node:latest

# Switch to project directory
WORKDIR /app
COPY package.json yarn.lock /app/

RUN apk add --no-cache make gcc g++ python

RUN npm install -g yarn pm2 && \
  yarn install --pure-lockfile --no-progress --production && \
  yarn cache clean

COPY . /app

VOLUME ["/app/node_modules", "/app/static"]
EXPOSE 2121
CMD ["yarn", "start"]
