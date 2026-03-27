// This and all other .js files should be treated as CommonJS:
// https://www.mongodb.com/docs/mongodb-shell/write-scripts/

// NOTE: This script will only run when the DB volume hasn't been previously initialized

try {
    // For some reason, environment variables aren't included in this process
    require('dotenv').config({ path: ['/run/secrets/.env'] });

    const env = require('./src/env');

    // Authenticating
    const admin = connect('localhost:27017/admin');

    admin.auth(env.admin.username, env.admin.password);

    // Disabling telemetry globally
    // (config doesn't seem to exist here)
    disableTelemetry();

    // Creating unprivileged user and database
    // NOTE: Databases and collections are hidden until data
    // is added to them, by default
    const msgBoard = admin.getSiblingDB(env.dbName);

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
catch (err) {
    console.error('Failed to create user:', err);
    throw err;
}
