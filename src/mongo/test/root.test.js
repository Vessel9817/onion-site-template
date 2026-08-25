const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { afterEach, beforeEach, describe, it } = require('node:test');

const ROOT_MODULE = require.resolve('../src/root');

/** @type {string} */
let dir;

/**
 * @param {string} name
 * @param {string} contents
 * @returns {string}
 */
function secret(name, contents) {
    const file = path.join(dir, name);

    fs.writeFileSync(file, contents);

    return file;
}

function load() {
    Reflect.deleteProperty(require.cache, ROOT_MODULE);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const root = /** @type {typeof import('../src/root')} */ (require(ROOT_MODULE));

    return root;
}

void describe('root', () => {
    beforeEach(() => {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'root-'));
    });

    afterEach(() => {
        delete process.env.ROOT_USERNAME_FILE;
        delete process.env.ROOT_PASSWORD_FILE;
        fs.rmSync(dir, { recursive: true, force: true });
    });

    void it('reads the credentials from the files the env names', () => {
        process.env.ROOT_USERNAME_FILE = secret('u', 'admin');
        process.env.ROOT_PASSWORD_FILE = secret('p', 'hunter2');

        const root = load();

        assert.equal(root.username, 'admin');
        assert.equal(root.password, 'hunter2');
    });

    void it('refuses an empty credential', () => {
        process.env.ROOT_USERNAME_FILE = secret('u', '');
        process.env.ROOT_PASSWORD_FILE = secret('p', 'hunter2');

        assert.throws(load, /username is missing/);
    });

    void it('refuses a missing file', () => {
        process.env.ROOT_USERNAME_FILE = path.join(dir, 'nope');
        process.env.ROOT_PASSWORD_FILE = secret('p', 'hunter2');

        assert.throws(load, /doesn't exist/);
    });
});
