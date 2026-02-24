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
COPY [ "./src/license-report/package.json", "./src/license-report/" ]
RUN npm i -w ./src/license-report/

# Copying source files
COPY --link [ "./src/express/package.json", "./src/express/" ]
COPY --link [ "./src/mongo/package.json", "./src/mongo/" ]
# 1000:1000 corresponds to user "node"
COPY --link --chown=1000:1000 [ "./src/license-report/", "./src/license-report/" ]

# Running app
USER node
ENTRYPOINT [ "/project/src/license-report/index.sh" ]
