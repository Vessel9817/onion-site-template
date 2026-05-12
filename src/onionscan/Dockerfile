ARG GO_VERSION=golang:1-alpine
ARG NODE_VERSION=node:lts-alpine

FROM ${GO_VERSION} AS onionscan

RUN go install github.com/harr1424/onionscan@latest

WORKDIR /project/

ENTRYPOINT [ "onionscan" ]
ARG TOR_PROXY="127.0.0.1:9150"
CMD [ \
    "--verbose", \
    "--torProxyAddress", "${TOR_PROXY}", \
    "-list", "/run/secrets/hostname" \
]
