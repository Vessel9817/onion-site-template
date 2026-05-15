ARG NODE_VERSION=node:lts-alpine

FROM ${NODE_VERSION} AS build

# Installing dependencies
WORKDIR /project/
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm ci --no-fund

# Building app
COPY [ "./", "./" ]
RUN npm run build

FROM ${NODE_VERSION} AS run

RUN \
    apk update \
    && apk add --no-cache curl

# Copying built app
WORKDIR /project/
# 1000:1000 corresponds to user "node"
COPY --from=build --chown=1000:1000 [ "/project/dist/", "./" ]
COPY --link [ "./views/", "./views/" ]

# Running app
USER node
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=1s --start-period=10s --retries=3 \
    CMD [ "curl", "-f", "localhost:3000" ]
CMD [ "--env-file=./secrets/.env", "index.cjs" ]
ENV PROJECT_ROOT="."
