ARG NODE_VERSION=node:lts-alpine3.22
ARG MONGO_VERSION=mongo:8.2.5

# Installing dependencies
FROM ${NODE_VERSION} AS build

WORKDIR /docker-entrypoint-initdb.d/
COPY [ "package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./" ]
RUN npm i --no-fund --omit=dev

# Running MongoDB
FROM ${MONGO_VERSION} AS run

WORKDIR /docker-entrypoint-initdb.d/
COPY --link --from=build [ "/docker-entrypoint-initdb.d/", "./" ]
COPY --link [ "./", "./" ]

HEALTHCHECK \
    --interval=5s \
    --timeout=5s \
    --start-period=10s \
    --retries=5 \
    CMD [ "mongosh", "--eval", "disableTelemetry();db.adminCommand('ping');" ]
