FROM alpine:3.22.0

ENV EXPOSE_PORT=80

WORKDIR /usr/app/
RUN \
    apk update && \
    apk add --no-cache socat
COPY --link [ "./", "./" ]

# Redirecting traffic from localhost to the NGINX container
# Note: requires env var FORWARD_IP
EXPOSE ${EXPOSE_PORT}
ENTRYPOINT [ "./index.sh" ]
