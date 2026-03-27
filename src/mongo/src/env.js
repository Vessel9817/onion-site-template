/**
 * Validates and exports env vars
 */

const assert = require('node:assert');
const fs = require('node:fs');

// DB name
// https://hub.docker.com/_/mongo#initializing-a-fresh-instance
const dbName = process.env.MONGO_INITDB_DATABASE ?? 'test';

// Admin username
const adminUsernameFile = process.env.MONGO_INITDB_ROOT_USERNAME_FILE;
assert.ok(
    adminUsernameFile,
    'MONGO_INITDB_ROOT_USERNAME_FILE is missing from env'
);
assert.ok(
    fs.existsSync(adminUsernameFile),
    "MONGO_INITDB_ROOT_USERNAME_FILE doesn't exist"
);
const adminUsername = fs.readFileSync(adminUsernameFile).toString();
assert.ok(adminUsername, 'Admin username is missing');

// Admin password
const adminPasswordFile = process.env.MONGO_INITDB_ROOT_PASSWORD_FILE;
assert.ok(
    adminPasswordFile,
    'MONGO_INITDB_ROOT_PASSWORD_FILE is missing from env'
);
assert.ok(
    fs.existsSync(adminPasswordFile),
    "MONGO_INITDB_ROOT_PASSWORD_FILE doesn't exist"
);
const adminPassword = fs.readFileSync(adminPasswordFile).toString();
assert.ok(adminPassword, 'Admin password is missing');

// Local username
const localUsernameFile = process.env.USERNAME_FILE;
assert.ok(localUsernameFile, 'USERNAME_FILE is missing from env');
assert.ok(fs.existsSync(localUsernameFile), "USERNAME_FILE doesn't exist");
const localUsername = fs.readFileSync(localUsernameFile).toString();
assert.ok(localUsername, 'Local username is missing');

// Local password
const localPasswordFile = process.env.PASSWORD_FILE;
assert.ok(localPasswordFile, 'PASSWORD_FILE is missing from env');
assert.ok(fs.existsSync(localPasswordFile), "PASSWORD_FILE doesn't exist");
const localPassword = fs.readFileSync(localPasswordFile).toString();
assert.ok(localPassword, 'Local password is missing');

module.exports = {
    dbName: dbName,
    admin: {
        username: adminUsername,
        password: adminPassword
    },
    user: {
        username: localUsername,
        password: localPassword
    }
};
