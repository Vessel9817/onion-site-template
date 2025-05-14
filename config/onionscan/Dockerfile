FROM golang:1.24.3-bookworm

RUN go install github.com/harr1424/onionscan@latest
WORKDIR $GOPATH/bin
RUN \
    mkdir -p app && \
    mv onionscan app/onionscan
WORKDIR $GOPATH/bin/app
COPY "./entrypoint.sh" "./entrypoint.sh"
EXPOSE 8080

ENTRYPOINT [ "bash", "./entrypoint.sh" ]
