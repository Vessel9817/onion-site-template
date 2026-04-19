ARG ALPINE_VERSION=alpine:3.23.3

FROM ${ALPINE_VERSION}

WORKDIR /project/
RUN \
    apk update \
    && apk add --no-cache \
        curl \
        socat

ARG USER=1000:1000
COPY --link --chown="${USER}" [ "./entrypoint.sh", "./" ]

ARG DOTENVX_VERSION=1.61.1
RUN \
    apk update \
    && apk add --no-cache curl \
    && curl -fsS "https://dotenvx.sh/?version=${DOTENVX_VERSION}" | sh \
    && dotenvx ext prebuild

USER "${USER}"
ENV EXPOSE_PORT=80
EXPOSE "${EXPOSE_PORT}"

# Redirecting traffic from localhost to the nginx container
# Note: requires env var FORWARD_ADDR
ENTRYPOINT [ "dotenvx", "run", "--", "/project/entrypoint.sh" ]
