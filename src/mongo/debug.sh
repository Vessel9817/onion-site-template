#!/bin/bash

# A mongo diagnostics script to be run inside the container

# Reference:
# https://www.mongodb.com/docs/manual/administration/tcmalloc-performance

fail=0

function assert_equals() {
    local actual="$1"
    local expected="$2"
    local it="$3"

    if ! [ "${actual}" = "${expected}" ]; then
        fail=1
        >&2 echo "${it}: expected "'"'"${expected}"'"'", got "'"'"${actual}"'"'""
    fi
}

# Currently can't change these settings within a container, see:
# https://docs.docker.com/reference/cli/docker/container/run/#currently-supported-sysctls
enabled="$(cat /sys/kernel/mm/transparent_hugepage/enabled || cat /sys/kernel/mm/redhat_transparent_hugepage/enabled)"
defrag="$(cat /sys/kernel/mm/transparent_hugepage/defrag || cat /sys/kernel/mm/redhat_transparent_hugepage/defrag)"
max_ptes_none="$(cat /sys/kernel/mm/transparent_hugepage/khugepaged/max_ptes_none || cat /sys/kernel/mm/redhat_transparent_hugepage/khugepaged/max_ptes_none)"

# https://stackoverflow.com/questions/48685667/what-does-docker-mean-when-it-says-memory-limited-without-swap
swappiness="$(cat /proc/sys/vm/swappiness)"

# https://forums.docker.com/t/how-to-set-the-vm-overcommit-memory-parameter-when-running-docker-desktop-on-macos/139029
overcommit_memory="$(cat /proc/sys/vm/overcommit_memory)"

assert_equals "${GLIBC_TUNABLES}" 'glibc.pthread.rseq=0' 'GLIBC_TUNABLES'
assert_equals "${max_ptes_none}" '0' 'mm.transparent_hugepage.khugepaged.max_ptes_none'
assert_equals "${enabled}" 'always' 'mm.transparent_hugepage.enabled'
assert_equals "${defrag}" 'defer+madvise' 'mm.transparent_hugepage.defrag'
assert_equals "${swappiness}" '1' 'vm.swappiness'
assert_equals "${overcommit_memory}" '1' 'vm.overcommit_memory'

tcmalloc="$(mongosh --eval 'disableTelemetry(); const assert = require("node:assert"); const stats = db.runCommand({ serverStatus: 1, tcmalloc: 1 }); assert.strictEqual(stats.ok, 1); console.log(stats.tcmalloc.usingPerCPUCaches); console.log(stats.tcmalloc.tcmalloc.cpu_free);')"
IFS=$'\n' read -r -d '' -a tcmalloc_stats < <( printf "%s\0" "${tcmalloc}" )

if [ "${tcmalloc_stats[0]}" = 'true' ]; then
    echo 'tcmalloc.usingPerCPUCaches is true'
    if [ "${tcmalloc_stats[1]}" = '0' ]; then
        fail=1
        >&2 echo "tcmalloc.tcmalloc.cpu_free: expected greater than 0, got ${tcmalloc_stats[1]}"
    fi
else
    echo 'tcmalloc.usingPerCPUCaches is false'
    echo "Please review: expected Linux kernel 4.18 or later, got "'"'"$(uname -r)"'"'""
fi

exit $fail
