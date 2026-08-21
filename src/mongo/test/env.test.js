const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { afterEach, beforeEach, describe, it } = require('node:test');

const ENV_MODULE = require.resolve('../src/env');
const VARS = [
    'ROOT_USERNAME_FILE',
    'ROOT_PASSWORD_FILE',
    'USERNAME_FILE',
    'PASSWORD_FILE',
    'MONGO_INITDB_DATABASE'
];

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
    Reflect.deleteProperty(require.cache, ENV_MODULE);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const env = /** @type {typeof import('../src/env')} */ (require(ENV_MODULE));

    return env;
}

beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mongo-env-'));
    process.env.ROOT_USERNAME_FILE = secret('root-username', 'root');
    process.env.ROOT_PASSWORD_FILE = secret('root-password', 'rootpw');
    process.env.USERNAME_FILE = secret('username', 'app');
    process.env.PASSWORD_FILE = secret('password', 'apppw');
    delete process.env.MONGO_INITDB_DATABASE;
});

afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });

    for (const name of VARS) {
        Reflect.deleteProperty(process.env, name);
    }
});

describe('mongo env', () => {
    it('reads both credential pairs and defaults the database name', () => {
        const env = load();

        assert.deepEqual(env.admin, { username: 'root', password: 'rootpw' });
        assert.deepEqual(env.user, { username: 'app', password: 'apppw' });
        assert.equal(env.dbName, 'test');
    });

    it('uses the configured database name', () => {
        process.env.MONGO_INITDB_DATABASE = 'msg_board';

        assert.equal(load().dbName, 'msg_board');
    });

    it('rejects a credential file that is missing', () => {
        process.env.PASSWORD_FILE = path.join(dir, 'absent');

        assert.throws(load, { message: /doesn't exist/ });
    });

    it('rejects a credential file that is empty', () => {
        process.env.PASSWORD_FILE = secret('empty', '');

        assert.throws(load, { message: /password is missing/ });
    });
});
