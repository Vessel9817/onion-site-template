ARG NODE_VERSION=node:lts-alpine3.22
ARG MONGO_VERSION=mongo:8.2.5
ARG DOTENVX_VERSION=1.61.1
ARG DOTENVX_CHECKSUM=sha256:a780992276e8b67dd6b5dd5d9223215ed99a0a4d3b18e0275b22ce44c90b8125
ARG MONGO_APP_PATH="./src/mongo"

# Installing dependencies
FROM ${NODE_VERSION} AS build

WORKDIR /docker-entrypoint-initdb.d/
ARG MONGO_APP_PATH
COPY [ "${MONGO_APP_PATH}/package.json", "./" ]
COPY [ "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm ci --no-fund --omit=dev

ARG DOTENVX_VERSION
ARG DOTENVX_CHECKSUM
ADD --chmod='+x' --checksum="${DOTENVX_CHECKSUM}" [ \
    "https://dotenvx.sh/?version=${DOTENVX_VERSION}", \
    "./dotenvx.sh" \
]
RUN \
    apk update \
    && apk add --no-cache curl \
    && sh './dotenvx.sh' \
    && rm './dotenvx.sh' \
    && dotenvx ext prebuild

ENTRYPOINT [ "dotenvx", "run", "--", "node" ]

# Running MongoDB
FROM ${MONGO_VERSION} AS run

WORKDIR /docker-entrypoint-initdb.d/
COPY --link --from=build [ "/docker-entrypoint-initdb.d/", "./" ]
ARG MONGO_APP_PATH
COPY --link [ "${MONGO_APP_PATH}", "./" ]

ARG DOTENVX_VERSION
ARG DOTENVX_CHECKSUM
ADD --chmod='+x' --checksum="${DOTENVX_CHECKSUM}" [ \
    "https://dotenvx.sh/?version=${DOTENVX_VERSION}", \
    "./dotenvx.sh" \
]
RUN \
    apt-get update -yqq \
    && apt-get install -yqq --no-install-recommends curl \
    && apt-get clean -qq \
    && sh './dotenvx.sh' \
    && rm './dotenvx.sh' \
    && dotenvx ext prebuild

# mongod doesn't natively support _FILE env vars
ENTRYPOINT [ "dotenvx", "run", "--", "/usr/local/bin/docker-entrypoint.sh" ]
CMD [ "mongod" ]
HEALTHCHECK \
    --interval=5s \
    --timeout=5s \
    --start-period=10s \
    --retries=5 \
    CMD [ "mongosh", "--eval", "disableTelemetry();db.adminCommand('ping');" ]
