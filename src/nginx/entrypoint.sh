#!/bin/sh

'/project/gixy-linux-x86_64' "$@"
'/usr/local/openresty/bin/openresty' -g "daemon off;"
