ARG NODE_VERSION=node:lts-alpine
# No major tag exists, so the series is bumped by hand, here and in smoke.sh
ARG MONGO_VERSION=mongodb/mongodb-community-server:8.3-ubi9-slim

# Installs dependencies
FROM ${NODE_VERSION} AS build

WORKDIR /docker-entrypoint-initdb.d/
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm ci --no-fund --omit=dev --include=optional

# 999 owns the keyfile and existing volumes; the image's own user is 1000
FROM ${MONGO_VERSION} AS server

USER root
RUN chown 999:999 /data/db /data/configdb
USER 999:999

# Starts replica node
FROM server AS run

WORKDIR /docker-entrypoint-initdb.d/
COPY --link --from=build [ "/docker-entrypoint-initdb.d/", "./" ]
COPY --link --exclude=*.sh --exclude=diagnose.js [ "./", "./" ]

WORKDIR /project/
COPY --link [ "./diagnose.js", "./" ]
COPY --link [ "./src/", "./src/" ]
COPY --link --chmod=+x [ "./diagnose.sh", "./" ]

# The image's entrypoint doesn't pass SIGTERM on to mongod
ENTRYPOINT [ "mongod" ]
# The keyfile authenticates members to each other and turns authorization on
CMD [ "--replSet", "dataset", "--keyFile", "/run/secrets/keyFile.pem", "--bind_ip_all" ]
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
FROM server AS init

WORKDIR /project/
COPY --link [ "./diagnose.js", "./" ]
COPY --link [ "./src/init.js", "./src/root.js", "./src/" ]
COPY --link --chmod=+x [ "./index.sh", "./diagnose.sh", "./" ]

ENTRYPOINT [ "/project/index.sh" ]
ENV HOST=mongo
ENV PORT=27017
