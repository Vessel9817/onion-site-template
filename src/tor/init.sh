#!/bin/sh

chmod 700 -R "/var/lib/tor/website/"
chown -R 100:100 "/var/lib/tor/website/"

chown -R debian-tor:debian-tor "/etc/tor/torrc"

tor -f /etc/tor/torrc User debian-tor "$@"
