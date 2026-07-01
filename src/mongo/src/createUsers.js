const assert = require('node:assert');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const env = /** @type {import('./env')} */ (require(`${__dirname}/env`));

/**
 * Creates an administrator and a user, if they don't already exist.
 * @param {import('../global').Db} db
 */
function createUsers(db) {
    // Only the primary node can create users
    if (!db.hello().isWritablePrimary) {
        return;
    }

    // Creating administrator
    const admin = connect('localhost:27017/admin');
    const adminUsers = admin.getUsers();

    assert.strictEqual(adminUsers.ok, 1,
        `Failed to fetch users from DB admin: ${JSON.stringify(adminUsers)}`);

    if (!adminUsers.users.map((user) => user.user).includes(env.admin.username)) {
        admin.createUser({
            user: env.admin.username,
            pwd: env.admin.password,
            roles: [
                {
                    role: 'root',
                    db: 'admin'
                }
            ]
        });
    }

    // Creating user
    // NOTE: Databases and collections are hidden
    // until data is added to them, by default
    const msgBoard = admin.getSiblingDB(env.dbName);
    const dbUsers = msgBoard.getUsers();

    assert.strictEqual(dbUsers.ok, 1,
        `Failed to fetch users from DB ${env.dbName}: ${JSON.stringify(dbUsers)}`);

    if (!dbUsers.users.map((user) => user.user).includes(env.user.username)) {
        // Authenticating
        admin.auth(env.admin.username, env.admin.password);

        // Disabling telemetry globally
        disableTelemetry();

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
    }
}

module.exports = { createUsers };
