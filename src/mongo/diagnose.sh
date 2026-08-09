#!/bin/sh

mongosh \
    --host "${HOST}" \
    --port "${PORT}" \
    -f '/project/diagnose.js'
