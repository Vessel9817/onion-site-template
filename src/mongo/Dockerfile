ARG NODE_VERSION=node:lts-alpine
ARG MONGO_VERSION=mongo:8

# Instals dependencies
FROM ${NODE_VERSION} AS build

WORKDIR /docker-entrypoint-initdb.d/
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm ci --no-fund --omit=dev

# Starts MongoDB replica
FROM ${MONGO_VERSION} AS run

WORKDIR /docker-entrypoint-initdb.d/
COPY --link --from=build [ "/docker-entrypoint-initdb.d/", "./" ]
COPY --link --exclude=init.mongodb.js [ "./", "./" ]

# mongod doesn't natively support *_FILE env vars,
# the built-in Docker shim does
ENTRYPOINT [ "/usr/local/bin/docker-entrypoint.sh" ]
CMD [ "mongod", "--replSet", "dataset" ]
HEALTHCHECK \
    --interval=5s \
    --timeout=5s \
    --start-period=10s \
    --retries=5 \
    CMD [ "mongosh", "--eval", "try{disableTelemetry();db.adminCommand('ping');}catch(err){console.error(err);throw err;}" ]

# Starts replica set
FROM ${MONGO_VERSION} AS init

WORKDIR /project/
COPY --link [ "./init.mongodb.js", "./" ]

ENTRYPOINT [ "/usr/local/bin/docker-entrypoint.sh" ]
ENV REPLICA_HOST='mongo-1:27017'
CMD [ "mongod", "--host", "${REPLICA_HOST}", "-f", "/project/init.mongodb.js" ]
