# Using current stable version of Python
# EOL: Oct 2031
# https://devguide.python.org/versions/
ARG PYTHON_VERSION=python:3.15-slim

FROM ${PYTHON_VERSION} AS vanguards

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        python3-stem \
    && apt-get clean -qq

WORKDIR /project/
ARG VANGUARDS_URL=https://github.com/mikeperry-tor/vanguards.git#6aea6ce32b06098a597f4203ec3fbb06a0859bab
ADD [ "$VANGUARDS_URL", "./vanguards/" ]
WORKDIR /project/vanguards/
RUN pip install -r "./requirements.txt"

ENTRYPOINT [ "python3", "/project/vanguards/src/vanguards.py" ]

FROM vanguards AS run

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        curl \
        tor \
    && apt-get clean \
    && chmod 700 -R "/var/lib/tor" \
    && chown -R debian-tor:debian-tor "/var/lib/tor" \
    && chown -R debian-tor:debian-tor "/etc/tor"

WORKDIR /project/
COPY --link --chmod="+x" [ "./entrypoint.sh", "./" ]

ENTRYPOINT [ "/project/entrypoint.sh" ]
ENV DISABLE_VANGUARDS=
ENV SOCKS_PORT=9050
EXPOSE "${SOCKS_PORT}"
