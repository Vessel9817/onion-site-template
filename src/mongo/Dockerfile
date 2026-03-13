ARG NODE_VERSION=node:lts-alpine3.22@sha256:76db75ca7e7da9148ae42c92d9be12d12a8d7b03e171f18339355d8078d644a0
ARG MONGO_VERSION=mongo:8.2.5@sha256:474f5c3bf0e355bb97dafda730e725169a4d51c5578abf7be9ec7ad3fdee4481

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
