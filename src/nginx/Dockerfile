ARG OPENRESTY_VERSION=openresty/openresty:noble

FROM ${OPENRESTY_VERSION} AS openresty-gixy

WORKDIR /project/

# Installing Gixy
ARG GIXY_VERSION="v0.2.51"
ARG GIXY_CHECKSUM="sha256:7341fd7e6cdc0baa7e7a8cd3a79bf92ff97bab37ca63d81f9b883291421d18f4"
ADD --checksum="${GIXY_CHECKSUM}" --chmod="+x" [ \
    "https://github.com/dvershinin/gixy/releases/download/${GIXY_VERSION}/gixy-linux-x86_64", \
    "./" \
]

# Configuring nginx to run after Gixy
COPY --link --chmod="+x" [ "./entrypoint.sh", "./" ]

# Depends on PROXY_ADDRESS env var
ENTRYPOINT [ "/project/entrypoint.sh" ]
CMD [ "--fix", "/usr/local/openresty/nginx/conf/nginx.conf" ]
