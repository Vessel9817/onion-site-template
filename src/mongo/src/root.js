/**
 * The administrator's credentials, read from the secret files
 */

const assert = require('node:assert');
const fs = require('node:fs');

// Environment variables need to be manually included, even when set by Docker.
// The init image carries no dependencies, so the files fall back to their mount paths.
try {
    require('dotenv').config({
        path: ['/run/secrets/.env'],
        quiet: true
    });
}
catch {
    // No dotenv here
}

const usernameFile = process.env.ROOT_USERNAME_FILE ?? '/run/secrets/root/username.txt';
const passwordFile = process.env.ROOT_PASSWORD_FILE ?? '/run/secrets/root/password.txt';

assert.ok(fs.existsSync(usernameFile), `Admin username file doesn't exist: ${usernameFile}`);
assert.ok(fs.existsSync(passwordFile), `Admin password file doesn't exist: ${passwordFile}`);

const username = fs.readFileSync(usernameFile).toString();
const password = fs.readFileSync(passwordFile).toString();

assert.ok(username, 'Admin username is missing');
assert.ok(password, 'Admin password is missing');

module.exports = {
    username: username,
    password: password
};
