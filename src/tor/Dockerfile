# Using current stable version of Python
# EOL: Oct 2030
# https://devguide.python.org/versions/
ARG PYTHON_VERSION=python:3.14-slim

FROM ${PYTHON_VERSION} AS vanguards

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        curl \
        git \
        python3-stem \
    && apt-get clean -qq

# Installing Vanguards with Python 3.12+ support
# https://github.com/mikeperry-tor/vanguards/pull/105
WORKDIR /project/
RUN git clone https://github.com/mikeperry-tor/vanguards \
    && cd vanguards \
    && git fetch origin pull/105/head:local \
    && git switch local \
    && pip install -r "./requirements.txt"

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

ENTRYPOINT [ "dotenvx", "run", "--", "python3", "/project/vanguards/src/vanguards.py" ]

FROM vanguards AS run

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        curl \
        tor \
    && apt-get clean \
    && chmod 700 -R "/var/lib/tor" \
    && chown -R debian-tor:debian-tor "/var/lib/tor" \
    && chown -R debian-tor:debian-tor "/etc/tor"

COPY --link --chmod="+x" [ "./entrypoint.sh", "./" ]

RUN dotenvx ext prebuild

ENTRYPOINT [ "dotenvx", "run", "--", "/project/entrypoint.sh" ]
ENV SOCKS_PORT=9050
EXPOSE "${SOCKS_PORT}"
