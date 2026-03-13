ARG GO_VERSION=golang:1.24.0-alpine@sha256:2d40d4fc278dad38be0777d5e2a88a2c6dee51b0b29c97a764fc6c6a11ca893c

FROM ${GO_VERSION}

RUN go install github.com/harr1424/onionscan@latest
WORKDIR $GOPATH/bin
RUN mkdir -p app \
    && mv onionscan app/onionscan

WORKDIR $GOPATH/bin/app
COPY [ "./entrypoint.sh", "./" ]

ENTRYPOINT [ "./entrypoint.sh" ]
EXPOSE 8080
