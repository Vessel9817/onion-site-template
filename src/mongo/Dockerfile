ARG NODE_VERSION=node:lts-alpine
ARG MONGO_VERSION=mongo:8

# Installs dependencies
FROM ${NODE_VERSION} AS build

WORKDIR /docker-entrypoint-initdb.d/
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm ci --no-fund --omit=dev

# Starts replica node
FROM ${MONGO_VERSION} AS run

# Top-level .js or .mongodb files will be run as startup scripts
# on DB initialization only (first run), before the replica set is initialized
WORKDIR /docker-entrypoint-initdb.d/
COPY --link --from=build [ "/docker-entrypoint-initdb.d/", "./" ]
COPY --link --exclude=*.sh [ "./", "./" ]

# Corresponds to user mongodb
USER 999:999
CMD [ \
    "mongod", \
    "--replSet", "dataset" \
]
HEALTHCHECK \
    --interval=1s \
    --timeout=5s \
    --start-period=1s \
    --retries=5 \
    CMD [ "mongosh", "-f", "/docker-entrypoint-initdb.d/src/healthcheck.js" ]

# Initializes replica set
FROM ${MONGO_VERSION} AS init

WORKDIR /project/
COPY [ "./index.sh", "./" ]

# Corresponds to user mongodb
USER 999:999
ENTRYPOINT [ "/project/index.sh" ]
ENV HOST=mongo
ENV PORT=27017
