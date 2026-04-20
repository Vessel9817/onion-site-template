ARG NODE_VERSION=node:lts-alpine3.22
ARG MONGO_VERSION=mongo:8.2.5

# Installing dependencies
FROM ${NODE_VERSION} AS build

WORKDIR /docker-entrypoint-initdb.d/
COPY [ "./src/mongo/package.json", "./" ]
COPY [ "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm ci --no-fund --omit=dev

ARG DOTENVX_VERSION=1.61.1
RUN \
    apk update \
    && apk add --no-cache curl \
    && curl -fsS "https://dotenvx.sh/?version=${DOTENVX_VERSION}" | sh \
    && dotenvx ext prebuild

ENTRYPOINT [ "dotenvx", "run", "--", "node" ]

# Running MongoDB
FROM ${MONGO_VERSION} AS run

WORKDIR /docker-entrypoint-initdb.d/
COPY --link --from=build [ "/docker-entrypoint-initdb.d/", "./" ]
COPY --link [ "./src/mongo/", "./" ]

HEALTHCHECK \
    --interval=5s \
    --timeout=5s \
    --start-period=10s \
    --retries=5 \
    CMD [ "mongosh", "--eval", "disableTelemetry();db.adminCommand('ping');" ]
