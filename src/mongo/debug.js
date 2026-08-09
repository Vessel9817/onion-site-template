/**
 * A diagnostics script for diagnosing mongo(sh) warnings.
 *
 * Logs diagnostic issues at warning level.
 * Logs script errors at error level.
 */

try {
    disableTelemetry();

    // Bundling external dependencies will require extended build functionality
    const fs = require('node:fs'); // mongosh behaves weirdly with promises
    const os = require('node:os');

    /**
     * Reads the given file and returns its contents
     * @param {string} file The file path
     * @returns {string}
     */
    function readFile(file) {
        return fs.readFileSync(file).toString().trim();
    }

    /**
     * Asserts string equality. Logs errors without terminating.
     * @param {string} actual The actual value
     * @param {string} expected The expected value
     * @param {string} it The name of the value being tested
     * @returns {boolean} `true` if the strings are equal, otherwise `false`
     */
    function assertEqual(actual, expected, it) {
        if (actual !== expected) {
            console.warn(`${it}: expected ${expected}, got: ${actual}`);

            return false;
        }

        return true;
    }

    function diagnoseTcmalloc() {
        /*
         * Can be changed in the container or by Docker
         */

        const glicbTunables = process.env.GLIBC_TUNABLES ?? '';

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

        // https://www.mongodb.com/docs/manual/administration/tcmalloc-performance
        assertEqual(glicbTunables, 'glibc.pthread.rseq=0', 'GLIBC_TUNABLES');
        assertEqual(
            maxPtesNone,
            '0',
            'mm.transparent_hugepage.khugepaged.max_ptes_none'
        );
        assertEqual(enabled, 'always', 'mm.transparent_hugepage.enabled');
        assertEqual(defrag, 'defer+madvise', 'mm.transparent_hugepage.defrag');
        assertEqual(swappiness, '1', 'vm.swappiness');
        assertEqual(overcommitMemory, '1', 'vm.overcommit_memory');

        const stats = db.serverStatus({ tcmalloc: 1 });

        if (stats.ok !== 1) {
            console.error(`Mongosh failed to connect to the database. Got response: ${JSON.stringify(stats)}`);
            return;
        }

        const MIN_KERNEL_MAJOR_VER = 4;
        const MIN_KERNEL_MINOR_VER = 18;
        const usingPerCPUCaches = /** @type {boolean} */ (stats.tcmalloc?.usingPerCPUCaches);
        const cpuFree = /** @type {number} */ (stats.tcmalloc?.tcmalloc.cpu_free);
        const kernelVerStr = os.release();
        const kernelVer = /^(\d+)(?:\.(\d+))?/.exec(kernelVerStr);

        // https://www.mongodb.com/docs/manual/administration/tcmalloc-performance/#enable-per-cpu-caches
        if (usingPerCPUCaches) {
            if (cpuFree < 1) {
                console.warn(`tcmalloc.tcmalloc.cpu_free: expected at least 1, got: ${cpuFree.toString()}`);
            }
        }
        else if (kernelVer == null) {
            console.error(`Unable to parse kernel version: ${kernelVerStr}`);
        }
        else {
            const kernelMajorVer = Number.parseInt(kernelVer[0]);
            const kernelMinorVer = Number.parseInt(kernelVer[1]);

            if (kernelMajorVer < MIN_KERNEL_MAJOR_VER || (kernelMajorVer >= MIN_KERNEL_MAJOR_VER && kernelMinorVer < MIN_KERNEL_MINOR_VER)) {
                console.warn(`Linux kernel: expected version ${MIN_KERNEL_MAJOR_VER.toString()}.${MIN_KERNEL_MINOR_VER.toString()} or later, got: ${kernelVerStr}`);
            }
        }
    }

    function diagnoseEngine() {
        /*
         * Currently can't change these settings within a container, see:
         * https://docs.docker.com/reference/cli/docker/container/run/#currently-supported-sysctls
         */

        const fsPath = '/proc/mounts';
        const mounts = readFile(fsPath);

        // https://stackoverflow.com/questions/78473427/mongodb-docker-vm-max-map-count-is-too-low-even-if-set-to-524288
        const maxMapCount = readFile('/proc/sys/vm/max_map_count');

        const stats = db.serverStatus({});

        if (stats.ok !== 1) {
            console.error(`Mongosh failed to connect to the database. Got response: ${JSON.stringify(stats)}`);
            return;
        }

        const mongoEngine = /** @type {string} */ (stats.storageEngine?.name);
        let maxConnections = /** @type {number} */ (stats.connections?.current);
        const availableConns = /** @type {number} */ (stats.connections?.available);

        maxConnections += availableConns;

        // https://stackoverflow.com/a/18169432
        /** @type {string | undefined} */
        let fsType;

        for (const line of mounts.split('\n')) {
            if (!line) {
                continue;
            }

            const parts = line.split(/\s+/);

            if (parts.length < 3) {
                continue;
            }

            const mountpoint = parts[1];

            if (mountpoint === '/') {
                fsType = parts[2];
                break;
            }
        }

        // http://dochub.mongodb.org/core/prodnotes-filesystem
        if (fsType === undefined) {
            console.error(`Could not determine file system type from ${fsPath}`);
        }
        else if (mongoEngine === 'wiredTiger' || Number.parseInt(maxMapCount, 10) >= 2 * maxConnections) {
            assertEqual(fsType, 'xfs', 'File system type');
        }
    }

    /**
     * Runs diagnostics. Logs any issues. Resolution may not always be possible.
     */
    function diagnose() {
        diagnoseTcmalloc();
        diagnoseEngine();
    }

    // Running diagnostics
    diagnose();
}
catch (err) {
    console.error('Diagnostics script failed unexpectedly:', err);
    throw err;
}
