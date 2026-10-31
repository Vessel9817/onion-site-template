ARG OPENRESTY_VERSION=openresty/openresty:noble

# Ran as root to read secrets on startup
FROM ${OPENRESTY_VERSION} AS openresty-gixy

WORKDIR /project/

# Installing Gixy
COPY --chmod="+x" [ "./download-gixy.sh", "./" ]

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

# From nginx image; we fill it in, since OpenResty doesn't set it
ENV NGINX_VERSION="${NGINX_VERSION:-}"

# Depends on PROXY_ADDRESS env var
ENTRYPOINT [ "/project/entrypoint.sh" ]
CMD [ "--deep", "--nginx-version=auto", "--fix", "/usr/local/openresty/nginx/conf/nginx.conf" ]
