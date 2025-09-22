# Modifies volume permissions: https://stackoverflow.com/a/73255981
FROM alpine:3.22.0 AS init

WORKDIR /usr/app/
COPY --link --chmod="+x" [ "./init.sh", "./" ]

VOLUME [ "/secrets/" ]
ENTRYPOINT [ "./init.sh" ]

# Using latest stable Debian image (LTS EOL: 30 June 2028)
# https://www.debian.org/releases
# https://wiki.debian.org/LTS
FROM debian:bookworm-slim AS run

RUN \
    apt-get update && \
    apt-get install -y --no-install-recommends tor && \
    apt-get clean && \
    chmod 700 -R "/var/lib/tor" && \
    chown -R debian-tor:debian-tor "/var/lib/tor" && \
    chown -R debian-tor:debian-tor "/etc/tor"

# 101:103 corresponds to debian-tor
COPY --link --chown=101:103 [ "./torrc", "/etc/tor/" ]

# Running tor as a non-root user
VOLUME [ "/var/lib/tor/website/" ]
USER debian-tor
ENTRYPOINT [ "tor" ]
