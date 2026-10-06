ARG NODE_VERSION=node:lts-alpine

FROM ${NODE_VERSION} AS build

# Installing dependencies
WORKDIR /project/
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]
RUN npm ci --no-fund

# Building app
COPY [ "./", "./" ]
ARG BUILDER_ENTRYPOINT='./webpack/index.ts'
ENV NODE_ENV='production'
RUN npx tsx "${BUILDER_ENTRYPOINT}"

FROM ${NODE_VERSION} AS run

RUN \
    apk update \
    && apk add --no-cache curl

# Copying built app
WORKDIR /project/
COPY --from=build [ "/project/dist/", "./" ]
COPY --link [ "./views/", "./views/" ]

# Running app
USER node
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=1s --start-period=10s --retries=3 \
    CMD [ "curl", "-f", "localhost:3000" ]
# Above nginx's 4 x 8k header buffers, so nginx refuses first
CMD [ "--max-http-header-size=65536", "--env-file=./secrets/.env", "index.cjs" ]
