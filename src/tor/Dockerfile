ARG ALPINE_VERSION=alpine:3.23.3@sha256:25109184c71bdad752c8312a8623239686a9a2071e8825f20acb8f2198c3f659

# Using latest stable Debian image (LTS EOL: 30 June 2030)
# https://www.debian.org/releases
# https://wiki.debian.org/LTS
ARG DEBIAN_VERSION=debian:trixie-slim@sha256:1d3c811171a08a5adaa4a163fbafd96b61b87aa871bbc7aa15431ac275d3d430

# Modifies volume permissions: https://stackoverflow.com/a/73255981
FROM ${ALPINE_VERSION} AS init

WORKDIR /project/
COPY --link --chmod="+x" [ "./init.sh", "./" ]

VOLUME [ "/secrets/" ]
ENTRYPOINT [ "./init.sh" ]

FROM ${DEBIAN_VERSION} AS run

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        curl \
        tor \
    && apt-get clean \
    && chmod 700 -R "/var/lib/tor" \
    && chown -R debian-tor:debian-tor "/var/lib/tor" \
    && chown -R debian-tor:debian-tor "/etc/tor"

# 101:103 corresponds to user "debian-tor"
COPY --link --chown=101:103 [ "./torrc", "/etc/tor/" ]

# Running tor as a non-root user
USER debian-tor
ENTRYPOINT [ "tor" ]
ENV SOCKS_PORT=9050
EXPOSE "${SOCKS_PORT}"
