ARG ALPINE_VERSION=alpine:3.23.2@sha256:865b95f46d98cf867a156fe4a135ad3fe50d2056aa3f25ed31662dff6da4eb62

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
