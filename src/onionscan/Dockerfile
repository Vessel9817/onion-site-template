ARG GO_VERSION=golang:1.24.0-alpine
ARG NODE_VERSION=node:lts-alpine3.22

FROM ${GO_VERSION} AS onionscan

RUN go install github.com/harr1424/onionscan@latest

WORKDIR /project/

RUN ln -s '${GOPATH}/bin/onionscan'
COPY --link --chmod="+x" [ "./entrypoint.sh", "./" ]

ARG DOTENVX_VERSION="1.61.1"
RUN \
    apk update \
    && apk add --no-cache curl \
    && curl -fsS "https://dotenvx.sh/?version=${DOTENVX_VERSION}" | sh \
    && dotenvx ext prebuild

ENTRYPOINT [ "dotenvx", "run", "--", "/project/entrypoint.sh" ]
ENV WEB_PORT=8080
CMD [ "--verbose" ]
EXPOSE "${WEB_PORT}"
