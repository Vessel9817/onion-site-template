ARG NODE_VERSION=node:lts-alpine3.22@sha256:76db75ca7e7da9148ae42c92d9be12d12a8d7b03e171f18339355d8078d644a0

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
RUN npm i -w ./src/license-report/

COPY --link [ "./src/express/package.json", "./packages/express.json" ]
COPY --link [ "./src/mongo/package.json", "./packages/mongo.json" ]
COPY --link [ "./package.json", "./packages/website.json" ]
# 1000:1000 corresponds to user "node"
COPY --link --chown=1000:1000 [ "./src/license-report/", "./packages/" ]

# Running app
USER node
ENTRYPOINT [ "/project/packages/index.sh" ]
