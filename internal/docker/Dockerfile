FROM node:7.9.0-alpine

WORKDIR /user/src/app
COPY package.json yarn.lock /user/src/app

RUN yarn global add pm2 && \
  yarn install --pure-lockfile --no-progress --production && \
  yarn cache clean

COPY . /user/src/app

EXPOSE 2121

VOLUME ["/user/src/app/node_modules", "/user/src/app/static"]

CMD ["yarn", "start"]

LABEL org.label-schema.license="MIT" \
      org.label-schema.build-date="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
      org.label-schema.version="$DOCKER_TAG" \
      org.label-schema.schema-version="$(boldrapi-version)" \
      org.label-schema.name="BoldrAPI" \
      org.label-schema.description="API for Boldr CMF" \
      org.label-schema.usage="https://github.com/boldr/boldr-api" \
      org.label-schema.url="https://www.boldr.io" \
      org.label-schema.vendor="Boldr" \
      org.label-schema.vcs-ref="$SOURCE_COMMIT" \
      org.label-schema.vcs-url="https://github.com/boldr/boldr-api" \
      org.label-schema.docker.cmd="docker run -ti --rm strues/boldr-api <code.js>"
