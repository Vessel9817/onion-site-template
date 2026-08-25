/*
 * Waits for the replica set. Initiating it and creating the first user only
 * work over localhost with a keyfile, so a node's healthcheck does both; this
 * confirms the result from the network with the administrator's credentials.
 */

try {
    disableTelemetry();

    const assert = require('node:assert');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const root = /** @type {typeof import('./root')} */ (require(`${__dirname}/root`));

    const adminDb = db.getSiblingDB('admin');

    assert.strictEqual(adminDb.auth(root.username, root.password).ok, 1,
        'Administrator cannot authenticate');
    assert.strictEqual(rs.status().ok, 1, 'Replica set is not initiated');

    console.log('Replica set is up!');
}
catch (err) {
    console.error('Failed to confirm the replica set:', err);
    throw err;
}
