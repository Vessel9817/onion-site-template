/*
 * Logs the shell from `npm run mongosh` in as the administrator
 */

try {
    // Disabling telemetry locally
    disableTelemetry();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const root = /** @type {typeof import('./root')} */ (require(`${__dirname}/root`));

    db.getSiblingDB('admin').auth(root.username, root.password);
}
catch (err) {
    console.error('Login failed:', err);
    throw err;
}
