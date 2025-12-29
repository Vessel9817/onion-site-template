// This and all other JS files should be treated as CommonJS:
// https://www.mongodb.com/docs/mongodb-shell/write-scripts/

// NOTE: This script will only run when the DB volume hasn't been previously initialized

const env = require('./src/env');

// Authenticating
const admin = connect('localhost:27017/admin');

admin.auth(env.admin.username, env.admin.password);

// Disabling telemetry globally
// NOTE: load is used in place of require
// so that mongo globals are available to the script
load('./src/disableTelemetry.mongodb.js');

// Creating unprivileged user and database
const MSG_BOARD = admin.getSiblingDB(env.dbName);

MSG_BOARD.createUser({
    user: env.user.username,
    pwd: env.user.password,
    roles: [
        {
            role: 'readWrite',
            db: env.dbName
        }
    ]
});

// NOTE: Databases and collections are hidden until data
// is added to them, by default
MSG_BOARD.createCollection(env.collectionName);
