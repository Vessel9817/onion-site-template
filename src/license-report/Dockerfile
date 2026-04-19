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
RUN \
    apk update \
    && apk add --no-cache curl \
    && curl -fsS "https://dotenvx.sh/?version=${DOTENVX_VERSION}" | sh \
    && dotenvx ext prebuild

# Running app
USER node
ENTRYPOINT [ "dotenvx", "run", "--", "/project/packages/index.sh" ]
