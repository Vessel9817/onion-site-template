ARG GO_VERSION=golang:1.24.0-alpine@sha256:2d40d4fc278dad38be0777d5e2a88a2c6dee51b0b29c97a764fc6c6a11ca893c
ARG NODE_VERSION=node:lts-alpine3.22@sha256:76db75ca7e7da9148ae42c92d9be12d12a8d7b03e171f18339355d8078d644a0

FROM ${GO_VERSION} AS onionscan

RUN go install github.com/harr1424/onionscan@latest

WORKDIR /project/

RUN ln -s '${GOPATH}/bin/onionscan'
COPY --link --chmod="+x" [ "./entrypoint.sh", "./" ]

ENTRYPOINT [ "/project/entrypoint.sh" ]
ENV WEB_PORT=8080
CMD [ "--verbose" ]
EXPOSE "${WEB_PORT}"
