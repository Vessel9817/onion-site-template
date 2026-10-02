/**
 * A diagnostics script for diagnosing mongo(sh) warnings.
 *
 * Logs diagnostic issues at warning level.
 * Logs script errors at error level.
 */

// Note: Sysctls that can be set in the container:
// https://docs.docker.com/reference/cli/docker/container/run/#currently-supported-sysctls

try {
    disableTelemetry();

    // Bundling external dependencies will require extended build functionality (e.g, Webpack)
    const fs = require('node:fs'); // mongosh behaves weirdly with promises
    const os = require('node:os');

    /**
     * Reads the given file and returns its contents
     * @param {string} file The file path
     * @returns {string}
     */
    function readFile(file) {
        return fs.readFileSync(file, 'utf8').trim();
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

    /**
     * Asserts string equality. Logs errors without terminating.
     * @param {string} path The file path
     * @param {string} expected The expected value
     * @returns {boolean} `true` if the file's contents match, otherwise `false`
     */
    function assertSysctlEqual(path, expected) {
        return assertEqual(readFile(path), expected, path);
    }

    /**
     * Diagnoses potential causes of TCMalloc warnings
     * @returns {string[]} Instructions for fixing identified issues
     */
    function diagnoseTcmalloc() {
        /** @type {string[]} */
        const fixes = [];
        const glicbTunables = process.env.GLIBC_TUNABLES ?? '';

        // https://www.mongodb.com/docs/manual/administration/tcmalloc-performance
        if (!assertEqual(glicbTunables, 'glibc.pthread.rseq=0', 'GLIBC_TUNABLES')) {
            fixes.push(
                'In the container/image, set the enviroment variable:\n'
                + "GLIBC_TUNABLES='glibc.pthread.rseq=0"
            );
        }
        if (!assertSysctlEqual(
            '/sys/kernel/mm/transparent_hugepage/khugepaged/max_ptes_none',
            '0'
        )) {
            fixes.push(
                'On the host, run:\n'
                + `sudo sh -c 'echo "0" > /sys/kernel/mm/transparent_hugepage/khugepaged/max_ptes_none'\n`
                + 'This setting will not persist across boots.'
            );
        }
        if (!assertSysctlEqual(
            '/sys/kernel/mm/transparent_hugepage/enabled',
            'always' // MongoDB 8.0+, x86_64 and ARM64 only. Otherwise, 'disabled'
        )) {
            fixes.push(
                'On the host, run:\n'
                + `sudo sh -c 'echo "always" > /sys/kernel/mm/transparent_hugepage/enabled'\n`
                + 'This setting will not persist across boots.'
            );
        }
        if (!assertSysctlEqual(
            '/sys/kernel/mm/transparent_hugepage/defrag',
            'defer+madvise'
        )) {
            fixes.push(
                'On the host, run:\n'
                + `sudo sh -c 'echo "defer+madvise" > /sys/kernel/mm/transparent_hugepage/defrag'\n`
                + 'This setting will not persist across boots.'
            );
        }

        // https://stackoverflow.com/questions/48685667/what-does-docker-mean-when-it-says-memory-limited-without-swap
        if (!assertSysctlEqual('/proc/sys/vm/swappiness', '1')) {
            fixes.push(
                'On the host, run:\n'
                + 'sudo sysctl -w vm.swappiness=1'
            );
        }

        // https://forums.docker.com/t/how-to-set-the-vm-overcommit-memory-parameter-when-running-docker-desktop-on-macos/139029
        if (!assertSysctlEqual('/proc/sys/vm/overcommit_memory', '1')) {
            fixes.push(
                'On the host, run:\n'
                + 'sudo sysctl -w vm.overcommit_memory=1'
            );
        }

        const stats = db.serverStatus({ tcmalloc: 1 });

        if (stats.ok !== 1) {
            console.error(
                'Mongosh failed to connect to the database. Got response:\n'
                + JSON.stringify(stats, null, 2)
            );
            return fixes;
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
            const kernelMajorVer = Number.parseInt(kernelVer[1]);
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const kernelMinorVer = Number.parseInt(kernelVer[2] ?? 0);

            if (kernelMajorVer < MIN_KERNEL_MAJOR_VER || (kernelMajorVer === MIN_KERNEL_MAJOR_VER && kernelMinorVer < MIN_KERNEL_MINOR_VER)) {
                console.warn(`Linux kernel: expected version ${MIN_KERNEL_MAJOR_VER.toString()}.${MIN_KERNEL_MINOR_VER.toString()} or later, got: ${kernelVerStr}`);
            }
        }

        return fixes;
    }

    /**
     * Diagnoses potential causes of storage engine warnings
     * @returns {string[]} Instructions for fixing identified issues
     */
    function diagnoseEngine() {
        /** @type {string[]} */
        const fixes = [];
        const fsPath = '/proc/mounts';
        const mounts = readFile(fsPath);

        const maxMapCount = readFile('/proc/sys/vm/max_map_count');
        const stats = db.serverStatus({});

        if (stats.ok !== 1) {
            console.error(`Mongosh failed to connect to the database. Got response: ${JSON.stringify(stats)}`);
            return fixes;
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

        // https://dochub.mongodb.org/core/prodnotes-filesystem
        if (fsType === undefined) {
            console.error(`Could not determine file system type from ${fsPath}`);
        }
        else if (mongoEngine === 'wiredTiger') {
            if (!assertEqual(fsType, 'xfs', 'File system type')) {
                fixes.push('Format your host file system to use XFS');
            }
        }
        else if (Number.parseInt(maxMapCount, 10) >= 2 * maxConnections) {
            // Alternatively, reduce the process's RLIMIT_NOFILE value:
            // https://www.mongodb.com/docs/manual/reference/configuration-options/#mongodb-setting-net.maxIncomingConnections

            // MongoDB recommends a value of 131060 in production
            // https://stackoverflow.com/questions/78473427/mongodb-docker-vm-max-map-count-is-too-low-even-if-set-to-524288
            fixes.push(
                'On the host, run:\n'
                + `sudo sysctl -w vm.max_map_count=${(2 * maxConnections).toFixed()}`
            );
        }

        return fixes;
    }

    /**
     * Runs diagnostics. Logs any identfied issues and resolution steps, if any.
     * Should only be run once, at the end of a script.
     */
    function diagnose() {
        // serverStatus needs a login now that the keyfile turns authorization on
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const root = /** @type {typeof import('./src/root')} */ (require(`${__dirname}/src/root`));

        db.getSiblingDB('admin').auth(root.username, root.password);

        const fixes = [
            ...diagnoseTcmalloc(),
            ...diagnoseEngine()
        ];

        if (fixes.length < 1) {
            fixes.push('None');
        }
        else {
            process.exitCode = 1;
        }

        console.log('\nResolvable issues:');

        for (const fix of fixes) {
            // Indenting list
            console.log(`- ${fix.replaceAll('\n', '\n  ')}`);
        }
    }

    // Running diagnostics
    diagnose();
}
catch (err) {
    console.error('Diagnostics script failed unexpectedly:', err);
    throw err;
}
