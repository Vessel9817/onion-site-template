ARG ALPINE_VERSION=alpine:3

FROM ${ALPINE_VERSION}

WORKDIR /project/
RUN \
    apk update \
    && apk add --no-cache socat

ARG USER=1000:1000
COPY --link --chown="${USER}" [ "./entrypoint.sh", "./" ]

USER "${USER}"
ENV EXPOSE_PORT=80
EXPOSE "${EXPOSE_PORT}"

# Redirecting traffic from localhost to the nginx container
# Note: requires env var FORWARD_ADDR
ENTRYPOINT [ "/project/entrypoint.sh" ]
