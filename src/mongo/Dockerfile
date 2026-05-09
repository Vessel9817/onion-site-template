ARG NODE_VERSION=node:lts-alpine
ARG MONGO_VERSION=mongo:8

# Installing dependencies
FROM ${NODE_VERSION} AS build

WORKDIR /docker-entrypoint-initdb.d/
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm ci --no-fund --omit=dev

# Running MongoDB
FROM ${MONGO_VERSION} AS run

WORKDIR /docker-entrypoint-initdb.d/
COPY --link --from=build [ "/docker-entrypoint-initdb.d/", "./" ]
COPY --link [ "./", "./" ]

# mongod doesn't natively support _FILE env vars
ENTRYPOINT [ "/usr/local/bin/docker-entrypoint.sh" ]
CMD [ "mongod" ]
HEALTHCHECK \
    --interval=5s \
    --timeout=5s \
    --start-period=10s \
    --retries=5 \
    CMD [ "mongosh", "--eval", "disableTelemetry();db.adminCommand('ping');" ]
