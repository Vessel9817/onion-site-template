FROM debian:bookworm-slim

# Installing dependencies
RUN \
    apt-get update && \
    apt-get install socat -y --no-install-recommends && \
    apt-get clean

# Redirecting traffic from localhost to the NGINX container
EXPOSE 3000

ENTRYPOINT [ "/usr/bin/socat", "TCP-LISTEN:3000,fork", "TCP:10.5.2.2:3000" ]
