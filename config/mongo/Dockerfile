ARG NODE_VERSION=node:lts-alpine3.22
ARG MONGO_VERSION=mongo:8.2.3@sha256:7f5bbdafebde7c42e42e33396d01c0eda3eb753da8dae99071a30e350568a0a4

# Installing dependencies
FROM ${NODE_VERSION} AS build

WORKDIR /docker-entrypoint-initdb.d/
COPY [ "package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./" ]
RUN [ "npm", "i", "--omit=dev" ]

# Running MongoDB
FROM ${MONGO_VERSION} AS run

WORKDIR /docker-entrypoint-initdb.d/
COPY --from=build [ "/docker-entrypoint-initdb.d/", "./" ]
COPY --link [ "./", "./" ]

HEALTHCHECK \
    --interval=5s \
    --timeout=5s \
    --start-period=10s \
    --retries=3 \
    CMD [ "mongosh", "--eval", "disableTelemetry();db.adminCommand('ping');"]
