ARG GO_VERSION=golang:1-alpine
ARG NODE_VERSION=node:lts-alpine

FROM ${GO_VERSION} AS onionscan

RUN go install github.com/harr1424/onionscan@latest

WORKDIR /project/

ENTRYPOINT [ "onionscan" ]
