ARG NODE_VERSION=node:lts-alpine3.22

FROM ${NODE_VERSION}

WORKDIR /project/

# Installing license-report dependencies
COPY [ \
    "./package.json", \
    "./package-lock.json*", \
    "./npm-shrinkwrap.json*", \
    "./" \
]

COPY --link [ "./src/license-report/package.json", "./src/license-report/" ]
RUN npm ci --no-fund -w ./src/license-report/

COPY --link [ "./src/express/package.json", "./packages/express.json" ]
COPY --link [ "./src/mongo/package.json", "./packages/mongo.json" ]
COPY --link [ "./package.json", "./packages/website.json" ]
# 1000:1000 corresponds to user "node"
COPY --link --chown=1000:1000 [ "./src/license-report/", "./packages/" ]

ARG DOTENVX_VERSION=1.61.1
ARG DOTENVX_CHECKSUM=sha256:a780992276e8b67dd6b5dd5d9223215ed99a0a4d3b18e0275b22ce44c90b8125
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
ENTRYPOINT [ "dotenvx", "run", "--", "/project/packages/index.sh" ]
