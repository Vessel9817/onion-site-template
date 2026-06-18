try {
    // Disabling telemetry locally
    disableTelemetry();

    rs.initiate(require('./replicas.json'));
}
catch (err) {
    console.error(err);
    throw err;
}
