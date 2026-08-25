ARG NODE_VERSION=node:lts-alpine
ARG MONGO_VERSION=mongo:8

# Installs dependencies
FROM ${NODE_VERSION} AS build

WORKDIR /docker-entrypoint-initdb.d/
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm ci --no-fund --omit=dev --include=optional

# Starts replica node
FROM ${MONGO_VERSION} AS run

# Top-level .js or .mongodb files will be run as startup scripts
# on DB initialization only (first run), before the replica set is initialized
WORKDIR /docker-entrypoint-initdb.d/
COPY --link --from=build [ "/docker-entrypoint-initdb.d/", "./" ]
COPY --link --exclude=*.sh --exclude=diagnose.js [ "./", "./" ]

WORKDIR /project/
COPY --link [ "./diagnose.js", "./" ]
COPY --link [ "./src/", "./src/" ]
COPY --link --chmod=+x [ "./diagnose.sh", "./" ]

# Corresponds to user mongodb
USER 999:999
# The keyfile authenticates members to each other and turns authorization on
CMD [ "mongod", "--replSet", "dataset", "--keyFile", "/run/secrets/keyFile.pem" ]
# mongo recommends a minimum connection interval of 1s to avoid performance degradation
HEALTHCHECK \
    --interval=2s \
    --timeout=5s \
    # Covers initiation, election and the first user
    --start-period=30s \
    # Waits for election to complete
    --retries=10 \
    CMD [ "mongosh", "-f", "/docker-entrypoint-initdb.d/src/healthcheck.js" ]

# Confirms the replica set is up. Initiating it needs localhost, so a node's healthcheck does that
FROM ${MONGO_VERSION} AS init

WORKDIR /project/
COPY --link [ "./diagnose.js", "./" ]
COPY --link [ "./src/init.js", "./src/root.js", "./src/" ]
COPY --link --chmod=+x [ "./index.sh", "./diagnose.sh", "./" ]

# 999:999 corresponds to user mongodb
USER 999:999
ENTRYPOINT [ "/project/index.sh" ]
ENV HOST=mongo
ENV PORT=27017
