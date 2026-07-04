const assert = require('node:assert');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const env = /** @type {import('./env')} */ (require(`${__dirname}/env`));

/**
 * Creates an administrator and a user, if they don't already exist.
 * Also authenticates as the administrator.
 * @param {import('../global').Db} adminDb
 */
function createUsers(adminDb) {
    // Only the primary node can create users
    const hello = adminDb.hello();

    if (!hello.isWritablePrimary) {
        console.log("Couldn't create user: not primary");
        return;
    }

    const adminUsers = adminDb.getUsers();

    assert.strictEqual(adminUsers.ok, 1,
        `Failed to fetch users from DB admin: ${JSON.stringify(adminUsers)}`);

    if (!adminUsers.users.map((user) => user.user).includes(env.admin.username)) {
        adminDb.createUser({
            user: env.admin.username,
            pwd: env.admin.password,
            roles: [
                {
                    role: 'root',
                    db: 'admin'
                }
            ]
        });
        console.log('Created administrator!');
    }

    adminDb.auth(env.admin.username, env.admin.password);
    // Creating user
    // NOTE: Databases and collections are hidden
    // until data is added to them, by default
    const msgBoard = adminDb.getSiblingDB(env.dbName);
    const dbUsers = msgBoard.getUsers();

    assert.strictEqual(dbUsers.ok, 1,
        `Failed to fetch users from DB ${env.dbName}: ${JSON.stringify(dbUsers)}`);

    if (!dbUsers.users.map((user) => user.user).includes(env.user.username)) {
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
