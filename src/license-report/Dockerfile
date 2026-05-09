ARG NODE_VERSION=node:lts-alpine

FROM ${NODE_VERSION}

WORKDIR /project/

# Installing license-report dependencies
COPY [ "./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "./" ]

ARG LICENSE_REPORT_APP_PATH="./src/license-report"
COPY --link [ "${LICENSE_REPORT_APP_PATH}/package.json", "./src/license-report/" ]
RUN npm ci --no-fund -w "${LICENSE_REPORT_APP_PATH}"

ARG EXPRESS_APP_PATH="./src/express"
COPY --link [ "${EXPRESS_APP_PATH}/package.json", "./packages/express.json" ]
ARG MONGO_APP_PATH="./src/mongo"
COPY --link [ "${MONGO_APP_PATH}/package.json", "./packages/mongo.json" ]
COPY --link [ "./package.json", "./packages/website.json" ]
# 1000:1000 corresponds to user "node"
COPY --link --chown=1000:1000 [ "${LICENSE_REPORT_APP_PATH}", "./packages/" ]

# Running app
USER node
ENTRYPOINT [ "/project/packages/index.sh" ]
