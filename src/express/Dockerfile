ARG NODE_VERSION=node:lts-alpine
ARG DOTENVX_VERSION=1.61.1
ARG DOTENVX_CHECKSUM=sha256:a780992276e8b67dd6b5dd5d9223215ed99a0a4d3b18e0275b22ce44c90b8125

FROM ${NODE_VERSION} AS build

# Installing dependencies
WORKDIR /project/
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm ci --no-fund

# Building app
COPY [ "./", "./" ]

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
    && dotenvx ext prebuild \
    && npm run build

FROM ${NODE_VERSION} AS run

# Copying built app
WORKDIR /project/
# 1000:1000 corresponds to user "node"
COPY --from=build --chown=1000:1000 [ "/project/dist/", "./" ]
COPY --link [ "./views/", "./views/" ]

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

# Running app
USER node
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=1s --start-period=10s --retries=3 \
    CMD [ "curl", "-f", "localhost:3000" ]
ENTRYPOINT [ "dotenvx", "run", "--", "node" ]
CMD [ "--env-file=./secrets/.env", "index.cjs" ]
