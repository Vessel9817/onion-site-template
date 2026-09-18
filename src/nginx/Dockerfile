ARG OPENRESTY_VERSION=openresty/openresty:noble

FROM ${OPENRESTY_VERSION} AS openresty-gixy

WORKDIR /project/

# Installing Gixy
ARG GIXY_VERSION="v0.2.53"
ARG GIXY_CHECKSUM="sha256:2a97d94d5a6cc4e0924de13b5a4024328d3d074e79be01277ffddf77350b16c5"
ADD --checksum="${GIXY_CHECKSUM}" --chmod="+x" [ \
    "https://github.com/dvershinin/gixy/releases/download/${GIXY_VERSION}/gixy-linux-x86_64", \
    "./" \
]

# Configuring nginx to run after Gixy
COPY --link --chmod="+x" [ "./entrypoint.sh", "./" ]

# Depends on PROXY_ADDRESS env var
ENTRYPOINT [ "/project/entrypoint.sh" ]
CMD [ "--fix", "/usr/local/openresty/nginx/conf/nginx.conf" ]
