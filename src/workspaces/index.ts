// Keeps each workspace lockfile in step with the root lockfile, which npm and
// Dependabot update. The express and mongo images install from their own
// lockfile, so it must pin what the root pins and miss nothing.
// Usage: tsx index.ts [--fix]
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

type Entry = Record<string, unknown>;
type Packages = Record<string, Entry>;
type Kind = 'prod' | 'dev' | 'optional';

const __dirname = import.meta.dirname;
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const PREFIX = 'node_modules/'; // Not ideal in the general case, but OK for npm
const FIX = process.argv.includes('--fix');
// Set from how the workspace reaches an entry, never copied from the root
const FLAGS = ['dev', 'optional', 'devOptional'];
// The order npm writes lockfile keys in, ahead of the rest
const KEY_ORDER = ['name', 'version', 'lockfileVersion', 'resolved', 'integrity', 'requires', 'packages', 'dependencies'];
// Copied from package.json into the lockfile's own entry, as npm does
const MANIFEST_FIELDS = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
// Ends a problem that --fix leaves for a person
const BY_HAND = 'fix by hand';

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
 * @returns The lockfile's entries, by install location
 */
function packagesOf(file: string): Packages {
    return asObject(read(file).packages, `${file} packages`) as Packages;
}

/**
 * @param slot An install location, like node_modules/a/node_modules/b
 * @param entry The entry installed there
 * @returns The name the package was published under
 */
function nameOf(slot: string, entry: Entry): string {
    // An aliased package carries the name it was published under
    const name = entry.name ?? slot.slice(slot.lastIndexOf(PREFIX) + PREFIX.length);

    assert.ok(typeof name === 'string', `${slot} name should be a string`);

    return name;
}

/**
 * @param version A version, like 1.2.3 or 1.2.3-rc.1
 * @returns Its numbers, and its pre-release part if any
 */
function splitVersion(version: string): [number[], string | undefined] {
    const dash = version.indexOf('-');
    const release = dash === -1 ? version : version.slice(0, dash);

    return [release.split('.').map(Number), dash === -1 ? undefined : version.slice(dash + 1)];
}

/**
 * @param a A version, like 1.2.3 or 1.2.3-rc.1
 * @param b Another version
 * @returns Whether a is a later release than b
 */
function isNewer(a: string, b: string): boolean {
    const [partsA, preA] = splitVersion(a);
    const [partsB, preB] = splitVersion(b);

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);

        if (diff !== 0) {
            return diff > 0;
        }
    }

    // A release is later than its pre-releases
    return preA === undefined
        ? preB !== undefined
        : preB !== undefined && preA.localeCompare(preB, 'en', { numeric: true }) > 0;
}

/**
 * @param entry A lockfile entry
 * @returns Whether it is an installed package rather than a link or a missing peer
 */
function isInstalled(entry: Entry): boolean {
    return entry.link !== true && typeof entry.version === 'string';
}

/**
 * @param file The lockfile path, relative to the project root
 * @returns Every version each package resolves to
 */
function versionsOf(file: string): Map<string, Set<string>> {
    const versions = new Map<string, Set<string>>();

    for (const [slot, entry] of Object.entries(packagesOf(file))) {
        if (!slot.includes(PREFIX) || !isInstalled(entry)) {
            // A workspace, a link or a peer that is not installed
            continue;
        }

        const pkg = nameOf(slot, entry);

        versions.set(pkg, (versions.get(pkg) ?? new Set()).add(entry.version as string));
    }

    return versions;
}

/**
 * @returns Each workspace directory, relative to the project root
 */
function workspaceDirs(): string[] {
    const { workspaces } = read('package.json');
    // package.json accepts either a list of paths or an object holding one
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
 * Finds the package a module would load, as Node walks up node_modules
 * @param packages Lockfile entries
 * @param from Where the module is installed ('' for the project itself)
 * @param name The package name it imports
 * @returns The install location of that package, if any
 */
function resolve(packages: Packages, from: string, name: string): string | undefined {
    let base = from;

    for (;;) {
        const slot = base === '' ? PREFIX + name : `${base}/${PREFIX}${name}`;

        if (slot in packages) {
            return slot;
        }
        if (base === '') {
            return undefined;
        }

        const at = base.lastIndexOf(`/${PREFIX}`);

        base = at === -1 ? '' : base.slice(0, at);
    }
}

/**
 * @param entry A lockfile entry
 * @param own Whether it is the project's own entry, whose dev dependencies are installed
 * @returns Each dependency npm installs for it, and what kind of dependency it is
 */
function dependenciesOf(entry: Entry, own: boolean): Map<string, Kind> {
    const deps = new Map<string, Kind>();
    const optionalPeers = asObject(entry.peerDependenciesMeta ?? {}, 'peerDependenciesMeta');
    const fields: [string, Kind][] = [
        ['devDependencies', 'dev'],
        ['optionalDependencies', 'optional'],
        ['peerDependencies', 'prod'],
        ['dependencies', 'prod']
    ];

    for (const [field, kind] of fields) {
        if (field === 'devDependencies' && !own) {
            continue;
        }

        for (const name of Object.keys(asObject(entry[field] ?? {}, field))) {
            const meta = optionalPeers[name] as Entry | undefined;

            if (field !== 'peerDependencies' || meta?.optional !== true) {
                deps.set(name, kind);
            }
        }
    }

    return deps;
}

/**
 * @param packages Lockfile entries
 * @param skip The kinds of dependency not to follow
 * @returns Every install location the workspace reaches without them
 */
function reachable(packages: Packages, skip: Kind[]): Set<string> {
    const found = new Set(['']);
    const queue = [''];

    for (let slot = queue.shift(); slot !== undefined; slot = queue.shift()) {
        for (const [name, kind] of dependenciesOf(packages[slot], slot === '')) {
            const at = skip.includes(kind) ? undefined : resolve(packages, slot, name);

            if (at !== undefined && !found.has(at)) {
                found.add(at);
                queue.push(at);
            }
        }
    }

    return found;
}

/**
 * Sets the dev and optional flags from how each entry is reached
 * @param packages Lockfile entries
 */
function flag(packages: Packages): void {
    const prod = reachable(packages, ['dev']);
    const required = reachable(packages, ['optional']);
    const either = reachable(packages, ['dev', 'optional']);

    for (const [slot, entry] of Object.entries(packages)) {
        const dev = !prod.has(slot);
        const optional = !required.has(slot);

        if (slot.includes(PREFIX)) {
            packages[slot] = adopt(entry, { dev, optional, devOptional: !dev && !optional && !either.has(slot) });
        }
    }
}

/**
 * @param source The root lockfile's entry
 * @param flags The entry whose dev and optional flags to keep
 * @returns The root entry, with the workspace's flags
 */
function adopt(source: Entry, flags: Entry): Entry {
    const entry = Object.fromEntries(Object.entries(source).filter(([key]) => !FLAGS.includes(key)));

    for (const flag of FLAGS) {
        if (flags[flag] === true) {
            entry[flag] = true;
        }
    }

    return entry;
}

/**
 * @param value Any JSON value
 * @returns Whether it is an object other than an array
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Orders keys as npm writes a lockfile: its preferred keys, then the other
 * keys alphabetically, with object values after the rest
 * @param value Any JSON value
 * @returns The value with its keys reordered
 */
function ordered(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(ordered);
    }
    if (!isPlainObject(value)) {
        return value;
    }

    const rank = (key: string): number => KEY_ORDER.includes(key) ? KEY_ORDER.indexOf(key) : KEY_ORDER.length;

    return Object.fromEntries(Object.entries(value)
        .toSorted(([a, x], [b, y]) => Number(isPlainObject(x)) - Number(isPlainObject(y))
          || rank(a) - rank(b)
          || a.localeCompare(b, 'en'))
        .map(([key, child]) => [key, ordered(child)]));
}

interface Walk {
    workspace: string;
    root: Packages;
    packages: Packages;
    problems: string[];
    // Every version each package resolves to in the root
    versions: Map<string, Set<string>>;
    // Each workspace install location, and the root location it stands for
    seen: Map<string, string>;
}

/**
 * Finds a version newer than the root's, like a security update made in this
 * lockfile only, which copying the root would undo
 * @param walk The lockfile being rewritten
 * @param name The dependency
 * @param here Where it is installed in the workspace lockfile, if anywhere
 * @param source The root lockfile's entry for it
 * @returns The problem to report, if any
 */
function aheadOfRoot(walk: Walk, name: string, here: string | undefined, source: Entry): string | undefined {
    if (here === undefined || walk.seen.has(here)) {
        return undefined;
    }

    const current = String(walk.packages[here].version);
    const wanted = source.version as string;

    if (!isNewer(current, wanted) || walk.versions.get(nameOf(here, walk.packages[here]))?.has(current) === true) {
        return undefined;
    }

    return `${walk.workspace} ${name}: ${current} here, ${wanted} in the root; update the root first`
      + ` (npm update ${name} --package-lock-only), then run \`npm run workspaces:fix\`, or ${BY_HAND}`;
}

/**
 * Brings one dependency of `slot` into line with the root's
 * @param walk The lockfile being rewritten
 * @param slot Where the dependent is installed in the workspace lockfile
 * @param name The dependency
 * @returns The dependency's locations in the workspace and the root, if it is new to the walk
 */
function follow(walk: Walk, slot: string, name: string): [string, string] | undefined {
    const { workspace, root, packages, problems, seen } = walk;
    const from = resolve(root, seen.get(slot) ?? '', name);
    const source = from === undefined ? undefined : root[from];

    if (from === undefined || source === undefined || !isInstalled(source)) {
        // Optional dependencies and peers can be absent from both
        return undefined;
    }

    let here = resolve(packages, slot, name);
    const taken = here === undefined ? undefined : seen.get(here);
    const ahead = aheadOfRoot(walk, name, here, source);

    if (ahead !== undefined) {
        problems.push(ahead);

        return undefined;
    }

    if (taken !== undefined && root[taken].version === source.version) {
        return undefined;
    }
    // A version the root still installs elsewhere stays for its other dependents
    const shared = slot !== '' && here !== undefined && here !== `${slot}/${PREFIX}${name}`
      && packages[here].version !== source.version
      && walk.versions.get(nameOf(here, packages[here]))?.has(String(packages[here].version)) === true;

    if (here === undefined || taken !== undefined || shared) {
        // Hoisted when nothing else sits there, as npm prefers
        here = here === undefined && !(PREFIX + name in packages) ? PREFIX + name : `${slot}/${PREFIX}${name}`;

        if (slot === '' && here !== PREFIX + name) {
            problems.push(`${workspace} ${name}: the root installs two versions where this lockfile has one; ${BY_HAND}`);

            return undefined;
        }

        packages[here] = adopt(source, {});
        problems.push(`${workspace} ${name}: missing here, ${source.version as string} in the root`);
    }
    else if (packages[here].version !== source.version || packages[here].integrity !== source.integrity) {
        problems.push(`${workspace} ${name}: ${String(packages[here].version)} here, ${source.version as string} in the root`);
        packages[here] = adopt(source, packages[here]);
    }

    seen.set(here, from);

    return [here, from];
}

/**
 * Rewrites one workspace lockfile from the root lockfile. Starting from the
 * workspace, it follows each dependency in both trees at once, so a package
 * gets the version the root gives the same dependent, wherever npm hoisted it.
 * @param workspace The workspace directory, relative to the project root
 * @param root The root lockfile's entries
 * @param versions Every version each package resolves to in the root
 * @param problems Collects what was out of step
 * @returns The lockfile's new text
 */
function sync(workspace: string, root: Packages, versions: Map<string, Set<string>>, problems: string[]): string {
    const lockfile = path.join(workspace, 'package-lock.json');
    const text = fs.readFileSync(path.join(PROJECT_ROOT, lockfile), 'utf8');
    const parsed = asObject(JSON.parse(text), lockfile);
    const packages = asObject(parsed.packages, `${lockfile} packages`) as Packages;
    const own = asObject(packages[''], `${lockfile} own entry`);
    const manifest = read(path.join(workspace, 'package.json'));
    const home = path.posix.normalize(workspace).replace(/\/$/, '');
    const walk: Walk = { workspace, root, packages, problems, versions, seen: new Map([['', home]]) };

    // The lockfile's own entry follows package.json, as npm writes it
    for (const field of MANIFEST_FIELDS) {
        own[field] = manifest[field];
    }

    const queue = [''];

    for (let slot = queue.shift(); slot !== undefined; slot = queue.shift()) {
        for (const name of dependenciesOf(packages[slot], slot === '').keys()) {
            const next = follow(walk, slot, name);

            if (next !== undefined) {
                queue.push(next[0]);
            }
        }
    }

    // What nothing reaches any more, like a dependency an update dropped
    const kept = Object.entries(packages).filter(([slot, entry]) => {
        const needed = !slot.includes(PREFIX) || walk.seen.has(slot);

        if (!needed) {
            problems.push(`${workspace} ${nameOf(slot, entry)}: ${String(entry.version)} here, needed by nothing`);
        }

        return needed;
    });
    const result: Packages = Object.fromEntries(kept);

    flag(result);

    return JSON.stringify(ordered({ ...parsed, packages: result }), null, /\n( +)"/.exec(text)?.[1] ?? '    ')
      + (text.endsWith('\n') ? '\n' : '');
}

/**
 * Lists versions a workspace lockfile pins that are nowhere in the root lockfile.
 * npm keeps several versions of one package at once, so a version is matched
 * anywhere in the root tree rather than at the same path.
 * @param workspace The workspace directory, relative to the project root
 * @param root Every version each package resolves to in the root
 * @returns One line per version
 */
function unknownVersions(workspace: string, root: Map<string, Set<string>>): string[] {
    const problems: string[] = [];

    for (const [pkg, versions] of versionsOf(path.join(workspace, 'package-lock.json'))) {
        const known = root.get(pkg) ?? new Set();
        const held = known.size > 0 ? [...known].join(', ') : 'nothing';

        for (const version of versions.difference(known)) {
            problems.push(`${workspace} ${pkg}: ${version} here, ${held} in the root`);
        }
    }

    return problems;
}

/**
 * Checks, or with --fix rewrites, one workspace lockfile
 * @param workspace The workspace directory, relative to the project root
 * @param root The root lockfile's entries
 * @param rootVersions Every version each package resolves to in the root
 * @returns Whether the lockfile agrees with the root
 */
function checkWorkspace(workspace: string, root: Packages, rootVersions: Map<string, Set<string>>): boolean {
    const lockfile = path.join(PROJECT_ROOT, workspace, 'package-lock.json');
    const problems: string[] = [];
    const text = sync(workspace, root, rootVersions, problems);
    const byHand = problems.filter((problem) => problem.endsWith(BY_HAND));

    // The rest of the rewrite follows from these, so it is neither written nor listed
    if (byHand.length > 0) {
        for (const problem of new Set(byHand)) {
            console.error(problem);
        }

        return false;
    }
    if (FIX) {
        fs.writeFileSync(lockfile, text);
    }
    else if (text !== fs.readFileSync(lockfile, 'utf8').replaceAll('\r\n', '\n')) {
        problems.push(`${workspace}: the lockfile differs from what \`npm run workspaces:fix\` writes`);
    }

    // What the rewrite could not settle stays an error after --fix
    const unknown = unknownVersions(workspace, rootVersions);

    for (const problem of new Set([...problems, ...unknown])) {
        console.error(problem);
    }

    return FIX ? unknown.length === 0 : problems.length === 0 && unknown.length === 0;
}

/**
 * @returns Whether every workspace lockfile agrees with the root
 */
function check(): boolean {
    const root = packagesOf('package-lock.json');
    const rootVersions = versionsOf('package-lock.json');
    let synced = true;

    for (const workspace of workspaceDirs()) {
        if (!fs.existsSync(path.join(PROJECT_ROOT, workspace))) {
            console.warn(`${workspace}: no such workspace`);
        }
        else if (fs.existsSync(path.join(PROJECT_ROOT, workspace, 'package-lock.json'))) {
            synced = checkWorkspace(workspace, root, rootVersions) && synced;
        }
    }

    return synced;
}

if (!check()) {
    process.exitCode = 1;
}
