#!/bin/sh

mongosh \
    --host "${HOST}" \
    --port "${PORT}" \
    -f '/project/debug.js'
