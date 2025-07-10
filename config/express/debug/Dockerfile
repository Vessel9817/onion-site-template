FROM alpine:3.22.0

# Installing dependencies
RUN \
    apk update && \
    apk add --no-cache curl socat

# Redirecting traffic from localhost to the NGINX container
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=1s --start-period=10s --retries=3 \
    CMD [ "curl", "-f", "localhost:3000" ]
ENTRYPOINT [ "/usr/bin/socat", "TCP-LISTEN:3000,fork", "TCP:10.5.2.2:3000" ]
