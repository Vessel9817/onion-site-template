#!/bin/sh

chmod 700 -R "/var/lib/tor/website/"
chown -R 100:100 "/var/lib/tor/website/"

chown -R debian-tor:debian-tor "/etc/tor/torrc"

python3 '/project/vanguards/src/vanguards.py' &
tor -f /etc/tor/torrc User debian-tor "$@"
