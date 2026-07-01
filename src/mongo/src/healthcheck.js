/*
 * This and all other .js files should be treated as CommonJS:
 * https://www.mongodb.com/docs/mongodb-shell/write-scripts/
 */

try {
    // Disabling telemetry locally
    disableTelemetry();

    const assert = require('node:assert');

    // Creating users, if they don't already exist
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { createUsers } = /** @type {import('./createUsers')} */ (require(`${__dirname}/createUsers`));

    createUsers(db);

    // Testing DB connection
    assert.strictEqual(db.adminCommand('ping').ok, 1);
}
catch (err) {
    console.error('Failed to create user:', err);
    throw err;
}
