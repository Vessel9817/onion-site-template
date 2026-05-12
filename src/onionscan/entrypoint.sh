#!/bin/sh

onionscan \
    --torProxyAddress="${TOR_PROXY}" \
    "$@" \
    "${ONION_HOSTNAME}"
