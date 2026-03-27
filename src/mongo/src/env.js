/**
 * Validates and exports env vars
 */

const assert = require('node:assert');
const fs = require('node:fs');

require('dotenv').config({ path: ['/run/secrets/.env'] });

// https://hub.docker.com/_/mongo#initializing-a-fresh-instance
const dbName = process.env.MONGO_INITDB_DATABASE ?? 'test';

assert.ok(
    process.env.MONGO_INITDB_ROOT_USERNAME_FILE,
    'MONGO_INITDB_ROOT_USERNAME_FILE is missing from env'
);
assert.ok(
    fs.existsSync(process.env.MONGO_INITDB_ROOT_USERNAME_FILE),
    "MONGO_INITDB_ROOT_USERNAME_FILE doesn't exist"
);
const adminUsernameFile = process.env.MONGO_INITDB_ROOT_USERNAME_FILE;
const adminUsername = fs.readFileSync(adminUsernameFile).toString();
assert.ok(adminUsername, 'Admin username is missing');

assert.ok(
    process.env.MONGO_INITDB_ROOT_PASSWORD_FILE,
    'MONGO_INITDB_ROOT_PASSWORD_FILE is missing from env'
);
assert.ok(
    fs.existsSync(process.env.MONGO_INITDB_ROOT_PASSWORD_FILE),
    "MONGO_INITDB_ROOT_PASSWORD_FILE doesn't exist"
);
const adminPasswordFile = process.env.MONGO_INITDB_ROOT_PASSWORD_FILE;
const adminPassword = fs.readFileSync(adminPasswordFile).toString();
assert.ok(adminPassword, 'Admin password is missing');

assert.ok(
    process.env.USERNAME,
    'USERNAME is missing from env'
);
const userUsername = process.env.USERNAME;

assert.ok(
    process.env.PASSWORD,
    'PASSWORD is missing from env'
);
const userPassword = process.env.PASSWORD;

module.exports = {
    dbName: dbName,
    admin: {
        username: adminUsername,
        password: adminPassword
    },
    user: {
        username: userUsername,
        password: userPassword
    }
};
