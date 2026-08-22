// Checks that every version a workspace lockfile pins is also in the root
// lockfile. npm keeps several versions of one package at once, so a version is
// matched anywhere in the root tree rather than at the same path.
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const PREFIX = 'node_modules/'; // Not ideal in the general case, but OK for npm

/**
 * @param value The value to narrow
 * @param description What the value holds, for the error message
 * @returns The value, as an object
 */
function asObject(
    value: unknown,
    description: string
): Record<string, unknown> {
    assert.ok(typeof value === 'object', `${description} should be an object`);
    assert.ok(value !== null, `${description} is null`);
    assert.ok(!Array.isArray(value), `${description} should not be an array`);

    return value as Record<string, unknown>;
}

/**
 * @param file The path, relative to the project root
 * @returns The parsed file
 */
function read(file: string): Record<string, unknown> {
    const parsed: unknown = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8'));

    return asObject(parsed, file);
}

/**
 * @param file The lockfile path, relative to the project root
 * @returns Every version each package resolves to
 */
function versionsOf(file: string): Map<string, Set<string>> {
    const packages = asObject(read(file).packages, `${file} packages`);
    const versions = new Map<string, Set<string>>();

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
 * @returns Each workspace directory, relative to the project root
 */
function workspaceDirs(): string[] {
    const { workspaces } = read('package.json');
    // pacakge.json accepts either a list of paths or an object holding one
    const listed = Array.isArray(workspaces)
        ? workspaces
        : asObject(workspaces, 'package.json workspaces').packages;

    assert.ok(Array.isArray(listed), 'package.json workspaces should be a list of paths');

    const dirs: string[] = [];

    for (const dir of listed) {
        assert.ok(typeof dir === 'string', 'package.json workspace should be a path');

        dirs.push(dir);
    }

    return dirs;
}

/**
 * @returns Whether every workspace lockfile agrees with the root
 */
function check(): boolean {
    const root = versionsOf('package-lock.json');
    let synced = true;

    for (const workspace of workspaceDirs()) {
        const lockfile = path.join(workspace, 'package-lock.json');

        if (!fs.existsSync(path.join(PROJECT_ROOT, workspace))) {
            console.warn(`${workspace}: no such workspace`);
            continue;
        }
        if (!fs.existsSync(path.join(PROJECT_ROOT, lockfile))) {
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
