ARG GO_VERSION=golang:1-alpine
ARG NODE_VERSION=node:lts-alpine

FROM ${GO_VERSION} AS onionscan

RUN go install github.com/harr1424/onionscan@latest

WORKDIR /project/

RUN ln -s '${GOPATH}/bin/onionscan'
COPY --link --chmod="+x" [ "./entrypoint.sh", "./" ]

ARG DOTENVX_VERSION=1.61.1
ARG DOTENVX_CHECKSUM=sha256:a780992276e8b67dd6b5dd5d9223215ed99a0a4d3b18e0275b22ce44c90b8125
ADD --chmod='+x' --checksum="${DOTENVX_CHECKSUM}" [ \
    "https://dotenvx.sh/?version=${DOTENVX_VERSION}", \
    "./dotenvx.sh" \
]
RUN \
    apk update \
    && apk add --no-cache curl \
    && sh './dotenvx.sh' \
    && rm './dotenvx.sh' \
    && dotenvx ext prebuild

ENTRYPOINT [ "dotenvx", "run", "--", "/project/entrypoint.sh" ]
ENV WEB_PORT=8080
CMD [ "--verbose" ]
EXPOSE "${WEB_PORT}"
