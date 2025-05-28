# Using latest stable Debian image (LTS EOL: 30 June 2028)
# https://www.debian.org/releases
# https://wiki.debian.org/LTS
FROM debian:bookworm-slim
RUN \
    # Installing tor
    apt-get update && \
    apt-get install -y tor && \
    apt-get clean

# Configuring tor
# https://docs.docker.com/engine/reference/builder/#copy
COPY "./secrets/" "/var/lib/tor/website/"
COPY "./torrc" "/etc/tor/"
RUN \
    chmod 700 -R "/var/lib/tor" && \
    chown -R debian-tor:debian-tor "/var/lib/tor" && \
    chown -R debian-tor:debian-tor "/etc/tor"

# Running tor as a non-root user
USER debian-tor
ENTRYPOINT [ "tor" ]
