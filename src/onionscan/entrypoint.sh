#!/bin/sh

onionscan \
    -webport="${WEB_PORT}" \
    --torProxyAddress="${TOR_PROXY}" \
    "$@" \
    "${ONION_HOSTNAME}"
