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
COPY [ "./config/license-report/package.json", "./config/license-report/" ]
RUN npm i -w ./config/license-report/

# Copying source files
COPY --link [ "./config/express/package.json", "./config/express/" ]
COPY --link [ "./config/mongo/package.json", "./config/mongo/" ]
# 1000:1000 corresponds to user "node"
COPY --link --chown=1000:1000 [ "./config/license-report/", "./config/license-report/" ]

# Running app
USER node
ENTRYPOINT [ "/project/config/license-report/index.sh" ]
