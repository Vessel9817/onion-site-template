#!/bin/sh

'/usr/bin/socat' "TCP-LISTEN:${EXPOSE_PORT},fork" "TCP:${FORWARD_ADDR}"
