ARG OPENRESTY_VERSION=openresty/openresty:noble

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

ARG DOTENVX_VERSION=1.61.1
ARG DOTENVX_CHECKSUM=sha256:a780992276e8b67dd6b5dd5d9223215ed99a0a4d3b18e0275b22ce44c90b8125
ADD --chmod='+x' --checksum="${DOTENVX_CHECKSUM}" [ \
    "https://dotenvx.sh/?version=${DOTENVX_VERSION}", \
    "./dotenvx.sh" \
]
RUN \
    sh './dotenvx.sh' \
    && rm './dotenvx.sh' \
    && dotenvx ext prebuild

ENTRYPOINT [ "dotenvx", "run", "--", "/project/entrypoint.sh" ]
CMD [ "--fix", "/usr/local/openresty/nginx/conf/nginx.conf" ]
