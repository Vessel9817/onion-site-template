ARG GO_VERSION=golang:1-alpine

# Run as root to read hostname file
FROM ${GO_VERSION} AS onionscan

ARG ONIONSCAN_PACKAGE=github.com/harr1424/onionscan@cc1488c7746822a9ddc9518dcf6bd853758c3de3
RUN go install "$ONIONSCAN_PACKAGE"

ENTRYPOINT [ "onionscan" ]
