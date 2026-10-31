#!/bin/sh

# Gixy may return false positives
'/project/gixy' "$@"
exec nginx -g 'daemon off;'
