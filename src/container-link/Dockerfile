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

USER "${USER}"
ENV EXPOSE_PORT=80
EXPOSE "${EXPOSE_PORT}"

# Redirecting traffic from localhost to the nginx container
# Note: requires env var FORWARD_ADDR
ENTRYPOINT [ "dotenvx", "run", "--", "/project/entrypoint.sh" ]
