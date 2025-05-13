# Installing onionscan
FROM golang:1.24.3-bookworm

RUN [ "go", "install", "github.com/harr1424/onionscan@latest" ]
EXPOSE 8080

# Running onionscan
WORKDIR "$GOPATH/bin"
ENTRYPOINT [ "./onionscan", "--verbose", "--torProxyAddress=10.5.4.2:9050", "$HOSTNAME" ]
