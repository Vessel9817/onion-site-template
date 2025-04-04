# Using latest stable Debian image (LTS EOL: 30 June 2028)
# https://www.debian.org/releases
# https://wiki.debian.org/LTS
FROM debian:bookworm-slim
RUN \
    # Updating OS and installing dependencies
    apt update && \
    apt upgrade -y && \
    apt install -y tor && \
    apt clean

# Configuring Tor
# https://docs.docker.com/engine/reference/builder/#copy
COPY "./secrets/" "/var/lib/tor/website/"
RUN chmod 700 "/var/lib/tor/website/"
COPY "./torrc" "/etc/tor/"

ENTRYPOINT [ "tor" ]
