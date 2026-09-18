#!/bin/sh

'/project/gixy' "$@" \
    && '/usr/local/openresty/bin/openresty' -g "daemon off;"
