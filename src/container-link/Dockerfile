ARG ALPINE_VERSION=alpine:3.23.3@sha256:25109184c71bdad752c8312a8623239686a9a2071e8825f20acb8f2198c3f659

FROM ${ALPINE_VERSION}


WORKDIR /project/
RUN apk update \
    && apk add --no-cache socat

ARG USER=1000:1000
COPY --link --chown=${USER} [ "./index.sh", "./" ]
USER ${USER}

ENV EXPOSE_PORT=80
EXPOSE ${EXPOSE_PORT}

# Redirecting traffic from localhost to the nginx container
# Note: requires env var FORWARD_ADDR
ENTRYPOINT [ "/project/index.sh" ]
