ARG OPENRESTY_VERSION=openresty/openresty:1.29.2.2-noble@sha256:844b3d2c5e151acbfbfb3605131cac504e25ad27e1cd389307d92ab499f5ea93

FROM ${OPENRESTY_VERSION} AS openresty-gixy

WORKDIR /project/

# Installing Gixy
ARG GIXY_VERSION="v0.2.40"
ARG GIXY_CHECKSUM="sha256:df5ce5e527680aaecc4ac3ca32c601dcf92f47465bc107624d1ba87c767c1979"
ADD --checksum="${GIXY_CHECKSUM}" --chmod="+x" [ \
    "https://github.com/dvershinin/gixy/releases/download/${GIXY_VERSION}/gixy-linux-x86_64", \
    "./" \
]

# Configuring nginx to run after Gixy
COPY --link --chmod="+x" [ "./entrypoint.sh", "./" ]

ENTRYPOINT [ "/project/entrypoint.sh" ]
CMD [ "--fix", "/usr/local/openresty/nginx/conf/nginx.conf" ]
