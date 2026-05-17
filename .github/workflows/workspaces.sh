#!/bin/bash

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="${SCRIPT_DIR}/../.."

function check-workspace {
    local workspace="$1"
    local fail=0

    # Checking workspace lockfile matches generated
    mv "${workspace}/package-lock.json" "${workspace}/package-lock.json.old"
    npm i --package-lock-only --workspaces false --prefix "${workspace}"
    cmp "${workspace}/package-lock.json" "${workspace}/package-lock.json.old" || fail=1

    # Cleanup
    rm "${workspace}/package-lock.json"
    mv "${workspace}/package-lock.json.old" "${workspace}/package-lock.json"

    return ${fail}
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

exit $fail
