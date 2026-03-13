ARG ALPINE_VERSION=alpine:3.23.3@sha256:25109184c71bdad752c8312a8623239686a9a2071e8825f20acb8f2198c3f659

FROM ${ALPINE_VERSION}

ENV EXPOSE_PORT=80

WORKDIR /usr/app/
RUN \
    apk update && \
    apk add --no-cache socat
COPY --link [ "./", "./" ]

# Redirecting traffic from localhost to the NGINX container
# Note: requires env var FORWARD_ADDR
EXPOSE ${EXPOSE_PORT}
ENTRYPOINT [ "./index.sh" ]
