ARG OPENRESTY_VERSION=openresty/openresty:noble

FROM ${OPENRESTY_VERSION} AS openresty-gixy

WORKDIR /project/

# Installing Gixy
COPY [ "./download-gixy.sh", "./" ]

ARG TARGETPLATFORM
ARG TARGETOS
ARG TARGETARCH
ARG GIXY_URL
ARG GIXY_VERSION
ARG GIXY_CHECKSUM

RUN \
    './download-gixy.sh' \
    && rm './download-gixy.sh'

# Configuring nginx to run after Gixy
COPY --link --chmod="+x" [ "./entrypoint.sh", "./" ]

# Depends on PROXY_ADDRESS env var
ENTRYPOINT [ "/project/entrypoint.sh" ]
CMD [ "--deep", "--fix", "/usr/local/openresty/nginx/conf/nginx.conf" ]
