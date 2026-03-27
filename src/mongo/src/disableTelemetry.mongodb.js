try {
    disableTelemetry();
}
catch (err) {
    console.error('Failed to disable telemetry:', err);
    throw err;
}
