FROM python:3.15-slim-trixie

LABEL org.opencontainers.image.title="OnionBalance"
LABEL org.opencontainers.image.description="A Tor Onion Service load balancer"
LABEL org.opencontainers.image.vendor="The Tor Project"
LABEL org.opencontainers.image.licenses="GPL-3.0-or-later"
LABEL org.opencontainers.image.authors="Silvio Rhatto <rhatto@torproject.org>"
LABEL org.opencontainers.image.source="https://gitlab.torproject.org/tpo/onion-services/onionbalance"

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        socat \
        tor \
    && apt-get clean -qq

WORKDIR /onionbalance/

COPY [ "./", "./" ]
RUN pip3 install .

WORKDIR /
ENTRYPOINT [ "python3", "/onionbalance/onionbalance.py" ]
