#!/bin/bash

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="${SCRIPT_DIR}/../.."

function check-workspace {
    workspace="$1"
    dir="$(pwd)"

    # Checking workspace lockfile matches generated
    cd "${workspace}" || exit 1
    mv package-lock.json package-lock.json.old
    npm i --package-lock-only --workspaces false
    cmp package-lock.json package-lock.json.old

    # Cleanup
    rm package-lock.json.old
    cd "${dir}" || exit 1
}

fail=0

if ! check-workspace "${PROJECT_ROOT}/src/express"; then
    fail=$((fail | 1))
fi

if ! check-workspace "${PROJECT_ROOT}/src/mongo"; then
    fail=$((fail | 2))
fi

if ! check-workspace "${PROJECT_ROOT}/src/license-report"; then
    fail=$((fail | 4))
fi

exit "$fail"
