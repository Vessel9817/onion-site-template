// Checks that every version a workspace lockfile pins is also in the root
// lockfile. npm keeps several versions of one package at once, so a version is
// matched anywhere in the root tree rather than at the same path.
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PREFIX = 'node_modules/';

/**
 * @param {unknown} value The value to narrow
 * @param {string} description What the value holds, for the error message
 * @returns {Record<string, unknown>} The value, as an object
 */
function asObject(value, description) {
    assert.ok(typeof value === 'object', `${description} should be an object`);
    assert.ok(value !== null, `${description} is null`);
    assert.ok(!Array.isArray(value), `${description} should not be an array`);

    return /** @type {Record<string, unknown>} */ (value);
}

/**
 * @param {string} file The path, relative to the project root
 * @returns {Record<string, unknown>} The parsed file
 */
function read(file) {
    /** @type {unknown} */
    const parsed = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));

    return asObject(parsed, file);
}

/**
 * @param {string} file The lockfile path, relative to the project root
 * @returns {Map<string, Set<string>>} Every version each package resolves to
 */
function versionsOf(file) {
    const packages = asObject(read(file).packages, `${file} packages`);
    /** @type {Map<string, Set<string>>} */
    const versions = new Map();

    for (const [slot, value] of Object.entries(packages)) {
        const at = slot.lastIndexOf(PREFIX);

        if (at === -1) {
            // A workspace rather than one of its dependencies
            continue;
        }

        const { name, version } = asObject(value, `${file} ${slot}`);

        if (version === undefined) {
            // A peer or optional dependency that is not installed
            continue;
        }

        assert.ok(typeof version === 'string', `${file} ${slot} version should be a string`);

        // An aliased package carries the name it was published under
        const pkg = name ?? slot.slice(at + PREFIX.length);

        assert.ok(typeof pkg === 'string', `${file} ${slot} name should be a string`);

        versions.set(pkg, (versions.get(pkg) ?? new Set()).add(version));
    }

    return versions;
}

/**
 * @returns {string[]} Each workspace directory, relative to the project root
 */
function workspaceDirs() {
    const { workspaces } = read('package.json');
    // npm accepts either a list of paths or an object holding one
    const listed = Array.isArray(workspaces)
        ? workspaces
        : asObject(workspaces, 'package.json workspaces').packages;

    assert.ok(Array.isArray(listed), 'package.json workspaces should be a list of paths');

    /** @type {string[]} */
    const dirs = [];

    for (const dir of listed) {
        assert.ok(typeof dir === 'string', 'package.json workspace should be a path');

        dirs.push(dir);
    }

    return dirs;
}

/**
 * @returns {boolean} Whether every workspace lockfile agrees with the root
 */
function check() {
    const root = versionsOf('package-lock.json');
    let synced = true;

    for (const workspace of workspaceDirs()) {
        const lockfile = path.join(workspace, 'package-lock.json');

        if (!fs.existsSync(path.join(ROOT, workspace))) {
            console.warn(`${workspace}: no such workspace`);
            continue;
        }
        if (!fs.existsSync(path.join(ROOT, lockfile))) {
            continue;
        }

        for (const [pkg, versions] of versionsOf(lockfile)) {
            const known = root.get(pkg) ?? new Set();
            const held = known.size > 0 ? [...known].join(', ') : 'nothing';

            for (const version of versions.difference(known)) {
                console.error(`${workspace} ${pkg}: ${version} here, ${held} in the root`);
                synced = false;
            }
        }
    }

    return synced;
}

if (!check()) {
    process.exitCode = 1;
}
