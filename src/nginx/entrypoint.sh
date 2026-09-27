#!/bin/sh

'/project/gixy' "$@" \
    && exec openresty -g "daemon off;"
