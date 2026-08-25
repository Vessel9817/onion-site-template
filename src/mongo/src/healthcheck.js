/*
 * This and all other .js files should be treated as CommonJS:
 * https://www.mongodb.com/docs/mongodb-shell/write-scripts/
 *
 * Runs inside each node, over localhost. On a fresh replica set that is the
 * only place the keyfile lets anything happen: until a user exists, the
 * localhost exception allows replSetInitiate, replSetGetStatus and createUser,
 * and nothing else. Once a user exists, only credentials get in.
 * https://www.mongodb.com/docs/manual/core/localhost-exception/
 */

try {
    // Disabling telemetry locally
    disableTelemetry();

    const assert = require('node:assert');
    const fs = require('node:fs');
    const os = require('node:os');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const root = /** @type {typeof import('./root')} */ (require(`${__dirname}/root`));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const replicas = /** @type {typeof import('./replicas')} */ (require(`${__dirname}/replicas`));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const config = /** @type {import('../global').RsInitiateConfig} */ (
        JSON.parse(fs.readFileSync('/docker-entrypoint-initdb.d/replicas.json').toString())
    );

    /**
     * Authenticates as the administrator
     * @param {import('../global').Db} adminDb
     * @param {typeof import('./root')} admin The administrator's credentials
     * @returns {boolean} `false` if the credentials are refused, which on a fresh node means no user exists yet
     */
    function authenticate(adminDb, admin) {
        try {
            return adminDb.auth(admin.username, admin.password).ok === 1;
        }
        catch (err) {
            // AuthenticationFailed
            if (typeof err === 'object' && err != null && 'code' in err && err.code === 18) {
                return false;
            }

            throw err;
        }
    }

    /**
     * @returns {boolean} Whether this node belongs to an initiated replica set
     */
    function initiated() {
        try {
            return rs.status().ok === 1;
        }
        catch (err) {
            // NotYetInitialized
            if (typeof err === 'object' && err != null && 'code' in err && err.code === 94) {
                return false;
            }

            throw err;
        }
    }

    const adminDb = db.getSiblingDB('admin');

    if (!authenticate(adminDb, root)) {
        // No user exists yet, so the localhost exception is open
        if (!initiated()) {
            assert.ok(
                replicas.isInitiator(config, os.hostname()),
                `Waiting for ${replicas.initiator(config)} to initiate the replica set (this is ${os.hostname()})`
            );

            rs.initiate(config);
            console.log('Initiated replica set!');
        }

        // Users can only be created on the primary, and creating the first one
        // closes the localhost exception on every node once it replicates
        assert.strictEqual(db.hello().isWritablePrimary, true,
            'Waiting for a primary to create the administrator');

        adminDb.createUser({
            user: root.username,
            pwd: root.password,
            roles: [
                {
                    role: 'root',
                    db: 'admin'
                }
            ]
        });
        console.log('Created administrator!');

        assert.ok(authenticate(adminDb, root), 'Administrator cannot authenticate');
    }

    // Creating the database user, if it doesn't already exist
    load(`${__dirname}/createUsers.js`);

    // Testing DB connection
    assert.strictEqual(db.adminCommand('ping').ok, 1);

    console.log('OK');
}
catch (err) {
    console.error('Healthcheck failed:', err);
    throw err;
}
