ARG PYTHON_VERSION=python:3.12-slim

FROM ${PYTHON_VERSION}

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        git \
        python3-stem \
    && apt-get clean -qq

# Installing Vanguards with Python 3.12 support
# https://github.com/mikeperry-tor/vanguards/pull/105
WORKDIR /project/
ARG VANGUARDS_VERSION=v0.3.1
RUN git clone https://github.com/mikeperry-tor/vanguards \
    && cd vanguards \
    && git fetch origin pull/105/head:local \
    && git switch local \
    && pip install -r "./requirements.txt"

ENTRYPOINT [ "python3", "/project/vanguards/src/vanguards.py" ]
