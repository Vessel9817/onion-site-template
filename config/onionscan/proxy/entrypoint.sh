#!/usr/bin/env bash

# Forwarding HTTP traffic to proxy server
nginx -g 'daemon off;'

# Forwarding SOCKS5 traffic from to tor through port 3000
'/usr/bin/socat' TCP-LISTEN:1080,reuseaddr,fork SOCKS5:localhost:10.5.4.2:9050,socksport=3000
