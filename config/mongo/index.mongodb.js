/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// This and all other JS files should be treated as CommonJS:
// https://www.mongodb.com/docs/mongodb-shell/write-scripts/

const assert = require('node:assert');
const env = require('./src/env.cjs');

assert.ok(
    typeof db !== 'undefined',
    'db is not defined. Are you mixing JS and mongosh? See: https://www.mongodb.com/docs/mongodb-shell/write-scripts/'
);

// Authenticating
db.getSiblingDB('admin').auth(env.admin.username, env.admin.password);

disableTelemetry();

// Creating unprivileged user and database
// NOTE: Databases and collections are hidden until data
// is added to them, by default
db.createUser({
    user: env.user.username,
    pwd: env.user.password,
    roles: [
        {
            role: 'readWrite',
            db: env.dbName
        }
    ]
});

/** @type {unknown} */
const MSG_BOARD = db.getSiblingDB(env.dbName);

MSG_BOARD.createCollection(env.collectionName);
