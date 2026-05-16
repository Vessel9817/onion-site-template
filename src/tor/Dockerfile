# Using current stable version of Python
# EOL: Oct 2030
# https://devguide.python.org/versions/
ARG PYTHON_VERSION=python:3.14-slim

FROM ${PYTHON_VERSION} AS vanguards

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        python3-stem \
    && apt-get clean -qq

# Installing Vanguards with Python 3.12+ support
# https://github.com/mikeperry-tor/vanguards/pull/105
WORKDIR /project/
ADD [ "https://github.com/waveform80/vanguards.git#python312", "./vanguards/" ]
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
ENV SOCKS_PORT=9050
EXPOSE "${SOCKS_PORT}"
