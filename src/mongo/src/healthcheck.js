/*
 * This and all other .js files should be treated as CommonJS:
 * https://www.mongodb.com/docs/mongodb-shell/write-scripts/
 */

try {
    // Disabling telemetry locally
    disableTelemetry();

    const assert = require('node:assert');

    // Creating users, if they don't already exist
    load(`${__dirname}/createUsers.js`);

    // Testing DB connection
    assert.strictEqual(db.adminCommand('ping').ok, 1);

    console.log('OK');
}
catch (err) {
    console.error('Healthcheck failed:', err);
    throw err;
}
