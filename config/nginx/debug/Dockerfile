FROM debian:bookworm-slim

# Installing dependencies
RUN \
    apt-get update && \
    apt-get install socat -y --no-install-recommends && \
    apt-get clean

# Redirecting traffic from localhost to the nginx container
EXPOSE 80

ENTRYPOINT [ "/usr/bin/socat", "TCP-LISTEN:80,fork", "TCP:10.5.0.2:80" ]
