FROM golang:1.24.3-bookworm

RUN go install github.com/harr1424/onionscan@latest
WORKDIR $GOPATH/bin
EXPOSE 8080

ENTRYPOINT [ "./onionscan", "--verbose", "--torProxyAddress=10.5.4.253:9050", "$HOSTNAME" ]
