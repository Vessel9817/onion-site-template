#!/bin/bash

fail=0

if ! npm run tsc; then
    fail=$((fail | 1))
fi

if ! npm -w './src/express' run tsc; then
    fail=$((fail | 2))
fi

if ! npm -w './src/mongo' run tsc; then
    fail=$((fail | 4))
fi

if ! npm -w './src/license-report' run tsc; then
    fail=$((fail | 8))
fi

exit "$fail"
