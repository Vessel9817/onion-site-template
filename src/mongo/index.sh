#!/bin/sh

mongosh \
    --host "${HOST}" \
    --port "${PORT}" \
    -f '/project/src/init.js'
