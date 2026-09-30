#!/bin/sh
set -eu

exec socat "TCP-LISTEN:${EXPOSE_PORT},fork" "TCP:${FORWARD_ADDR}"
