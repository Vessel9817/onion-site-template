#!/usr/bin/env bash

# Running nginx in background
nginx -g 'daemon off;'

# Running socat
'/usr/bin/socat' TCP-LISTEN:9150,fork SOCKS5:10.5.4.2:9050,socksport=9150
