# Using latest stable Debian image (LTS EOL: 30 June 2030)
# https://www.debian.org/releases
# https://wiki.debian.org/LTS
ARG DEBIAN_VERSION=debian:trixie-slim

FROM ${DEBIAN_VERSION} AS run

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        curl \
        tor \
    && apt-get clean \
    && chmod 700 -R "/var/lib/tor" \
    && chown -R debian-tor:debian-tor "/var/lib/tor" \
    && chown -R debian-tor:debian-tor "/etc/tor"

COPY --link --chmod="+x" [ "./init.sh", "/project/" ]

ENTRYPOINT [ "/project/init.sh" ]
ENV SOCKS_PORT=9050
EXPOSE "${SOCKS_PORT}"
