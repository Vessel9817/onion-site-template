#!/bin/sh

# If unset, get the version of nginx running.
# Ignore the build version, as OpenResty sets it and Gixy doesn't expect it
if [ -z "$NGINX_VERSION" ]; then
    NGINX_VERSION="$(nginx -v 2>&1 | sed -r 's#[^0-9]*([0-9]+(\.[0-9]+){0,2}).*#\1#')"
fi

'/project/gixy' "$@" --nginx-version="$NGINX_VERSION" \
    && exec openresty -g "daemon off;"
