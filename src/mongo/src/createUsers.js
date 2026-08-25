const assert = require('node:assert');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const env = /** @type {typeof import('./env')} */ (require(`${__dirname}/env`));

/**
 * Creates the database user, if it doesn't already exist.
 * Expects the connection to be authenticated as the administrator.
 * Throws an error if the user doesn't exist and the connected node
 * isn't a writable primary.
 * @param {import('../global').Db} adminDb
 */
function createUsers(adminDb) {
    const hello = adminDb.hello();

    assert.strictEqual(hello.ok, 1,
        `Failed to ping node: ${JSON.stringify(hello)}`);

    // NOTE: Databases and collections are hidden
    // until data is added to them, by default
    const msgBoard = adminDb.getSiblingDB(env.dbName);
    const dbUsers = msgBoard.getUsers();

    assert.strictEqual(dbUsers.ok, 1,
        `Failed to fetch users from DB ${env.dbName}: ${JSON.stringify(dbUsers)}`);

    if (!dbUsers.users.map((user) => user.user).includes(env.user.username)) {
        assert.strictEqual(hello.isWritablePrimary, true,
            `User of database ${env.dbName} doesn't exist`);

        // Creating user with database permissions
        msgBoard.createUser({
            user: env.user.username,
            pwd: env.user.password,
            roles: [
                {
                    role: 'readWrite',
                    db: env.dbName
                }
            ]
        });
        console.log('Created DB user!');
    }
}

// Must be ran through `load`, not `require`
const adminDb = db.getSiblingDB('admin');

createUsers(adminDb);
