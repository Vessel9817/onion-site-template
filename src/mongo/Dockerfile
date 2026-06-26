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
COPY --link --exclude=replicas.json [ "./", "./" ]

CMD [ \
    "mongod", \
    "--replSet", "dataset", \
    "--clusterAuthMode", "keyFile", \
    "--keyFile", "/run/secrets/keyFile.pem", \
    "--bind_ip_all" \
]
HEALTHCHECK \
    --interval=5s \
    --timeout=5s \
    --start-period=10s \
    --retries=5 \
    CMD [ "mongosh", "--eval", "try{disableTelemetry();db.adminCommand('ping');}catch(err){console.error(err);throw err;}" ]

# Starts replica set
FROM ${MONGO_VERSION} AS init

WORKDIR /project/
COPY --link [ "./healthcheck.sh", "./" ]

CMD [ \
    "mongod", \
    "--replSet", "dataset", \
    "--clusterAuthMode", "keyFile", \
    "--keyFile", "/run/secrets/keyFile.pem", \
    "--bind_ip_all" \
]
HEALTHCHECK \
    --interval=15s \
    --timeout=10s \
    --start-period=20s \
    --retries=3 \
    CMD [ "/project/healthcheck.sh" ]
