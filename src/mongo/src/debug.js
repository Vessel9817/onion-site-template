#!/bin/node

/**
 * A mongo diagnostics script
 */

disableTelemetry();

const assert = require('node:assert');
const child_process = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
/** @type {import('semver')} */
let semver;

assert.doesNotThrow(
    () => {
        semver = require('semver');
    },
    'The optional dependency "semver" is required for diagnostics.'
);

/**
 * Reads the given file and returns its contents
 * @param {string} file The file path
 * @returns {Promise<string>}
 */
async function readFile(file) {
    return (await fs.readFile(file)).toString();
}

/**
 * Asserts string equality. Logs errors without terminating.
 * @param {string | undefined} actual The actual value
 * @param {string} expected The expected value
 * @param {string} it The name of the value being tested
 * @returns {boolean} `true` if the strings are equal, otherwise `false`
 */
function assertEqual(actual, expected, it) {
    if (actual !== expected) {
        console.error(`${it}: expected ${expected}, got: ${String(actual)}`);

        return false;
    }

    return true;
}

/**
 * Runs diagnostics. Logs any issues. Resolution may not always be possible.
 */
async function diagnose() {
    /*
     * Can be changed in the container or by Docker
     */

    const glicbTunables = process.env.GLIBC_TUNABLES;

    /*
     * Currently can't change these settings within a container, see:
     * https://docs.docker.com/reference/cli/docker/container/run/#currently-supported-sysctls
     */

    const enabled = readFile('/sys/kernel/mm/transparent_hugepage/enabled');
    const defrag = readFile('/sys/kernel/mm/transparent_hugepage/defrag');
    const maxPtesNone = readFile('/sys/kernel/mm/transparent_hugepage/khugepaged/max_ptes_none');

    // https://stackoverflow.com/questions/48685667/what-does-docker-mean-when-it-says-memory-limited-without-swap
    const swappiness = readFile('/proc/sys/vm/swappiness');

    // https://forums.docker.com/t/how-to-set-the-vm-overcommit-memory-parameter-when-running-docker-desktop-on-macos/139029
    const overcommitMemory = readFile('/proc/sys/vm/overcommit_memory');

    // https://stackoverflow.com/questions/78473427/mongodb-docker-vm-max-map-count-is-too-low-even-if-set-to-524288
    const maxMapCount = readFile('/proc/sys/vm/max_map_count');

    // Reference:
    // https://www.mongodb.com/docs/manual/administration/tcmalloc-performance
    assertEqual(glicbTunables, 'glibc.pthread.rseq=0', 'GLIBC_TUNABLES');
    assertEqual(
        await maxPtesNone,
        '0',
        'mm.transparent_hugepage.khugepaged.max_ptes_none'
    );
    assertEqual(await enabled, 'always', 'mm.transparent_hugepage.enabled');
    assertEqual(await defrag, 'defer+madvise', 'mm.transparent_hugepage.defrag');
    assertEqual(await swappiness, '1', 'vm.swappiness');
    assertEqual(await overcommitMemory, '1', 'vm.overcommit_memory');

    const stats = db.serverStatus({ tcmalloc: 1 });
    const connected = assertEqual(
        stats.ok.toString(),
        '1',
        `Mongosh failed to connect to the database. Got response: ${JSON.stringify(stats)}`
    );

    if (!connected) {
        return;
    }

    const MIN_KERNEL_VERSION = '4.18';
    const mongo_engine = stats.storageEngine.name;
    const usingPerCPUCaches = /** @type {boolean} */ (stats.tcmalloc?.usingPerCPUCaches);
    const cpuFree = /** @type {number} */ (stats.tcmalloc?.tcmalloc.cpu_free);
    const maxConnections = stats.connections.current + stats.connections.available;
    const fsType = child_process.execSync('/bin/stat -fc "%T"').toString();

    // http://dochub.mongodb.org/core/prodnotes-filesystem
    if (mongo_engine === 'wiredTiger' || Number.parseInt(await maxMapCount, 10) >= 2 * maxConnections) {
        assertEqual(fsType, 'xfs', 'File system type');
    }

    // https://www.mongodb.com/docs/manual/administration/tcmalloc-performance/#enable-per-cpu-caches
    if (usingPerCPUCaches) {
        if (cpuFree < 1) {
            console.error(`tcmalloc.tcmalloc.cpu_free: expected at least 1, got: ${cpuFree.toString()}`);
        }
    }
    else if (semver.compare(MIN_KERNEL_VERSION, os.release()) < 0) {
        console.log(`Linux kernel: expected version ${MIN_KERNEL_VERSION} or later, got: ${os.release()}`);
    }
}

// Running diagnostics
void (async () => {
    await diagnose();
})();
