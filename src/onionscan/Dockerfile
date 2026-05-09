ARG GO_VERSION=golang:1-alpine
ARG NODE_VERSION=node:lts-alpine

FROM ${GO_VERSION} AS onionscan

RUN go install github.com/harr1424/onionscan@latest

WORKDIR /project/

RUN ln -s '${GOPATH}/bin/onionscan'
COPY --link --chmod="+x" [ "./entrypoint.sh", "./" ]

ENTRYPOINT [ "/project/entrypoint.sh" ]
ENV WEB_PORT=8080
CMD [ "--verbose" ]
EXPOSE "${WEB_PORT}"
