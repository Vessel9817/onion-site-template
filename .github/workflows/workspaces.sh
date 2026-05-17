#!/bin/bash

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="${SCRIPT_DIR}/../.."

function check-workspace {
    local workspace="$1"
    # shellcheck disable=SC2155
    local dir="$(pwd)"
    local fail=0

    cd "${workspace}" || return 4

    # Checking workspace lockfile matches generated
    mv package-lock.json package-lock.json.old
    npm i --package-lock-only --workspaces false
    cmp package-lock.json package-lock.json.old || fail=1

    # Cleanup
    rm package-lock.json.old
    cd "${dir}" || fail=$((fail | 2))

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
