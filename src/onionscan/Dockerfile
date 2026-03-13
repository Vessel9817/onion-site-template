ARG GO_VERSION=golang:1.24.0-alpine@sha256:2d40d4fc278dad38be0777d5e2a88a2c6dee51b0b29c97a764fc6c6a11ca893c
ARG NODE_VERSION=node:lts-alpine3.22@sha256:76db75ca7e7da9148ae42c92d9be12d12a8d7b03e171f18339355d8078d644a0

FROM ${GO_VERSION} AS onionscan

RUN go install github.com/harr1424/onionscan@latest
WORKDIR $GOPATH/bin
RUN mkdir -p app \
    && mv onionscan app/onionscan

WORKDIR $GOPATH/bin/app
COPY [ "./entrypoint.sh", "./" ]

ENTRYPOINT [ "./entrypoint.sh" ]
EXPOSE 8080

FROM ${NODE_VERSION} AS onionscan-server

RUN mkdir -p /usr/app/src
WORKDIR /usr/app/src
COPY --exclude="entrypoint.sh" [ "package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./" ]
RUN npm i

# 1000:1000 corresponds to user "node"
COPY --link --chown=1000:1000 [ "./", "./" ]

USER node
EXPOSE 3000
CMD [ "npm", "start" ]
