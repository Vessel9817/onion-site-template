/**
 * Validates and exports env vars
 */

const assert = require('node:assert');
const fs = require('node:fs');

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const root = /** @type {typeof import('./root')} */ (require(`${__dirname}/root`));

// DB name
// https://hub.docker.com/_/mongo#initializing-a-fresh-instance
const dbName = process.env.MONGO_INITDB_DATABASE ?? 'test';

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
        username: root.username,
        password: root.password
    },
    user: {
        username: localUsername,
        password: localPassword
    }
};
