// This and all other .js files should be treated as CommonJS:
// https://www.mongodb.com/docs/mongodb-shell/write-scripts/

try {
    // Disabling telemetry locally
    disableTelemetry();

    rs.initiate({
        _id: 'dataset',
        members: [
            { _id: 1, host: 'mongo-1:27017', priority: 2 },
            { _id: 2, host: 'mongo-2:27017', priority: 1 },
            { _id: 3, host: 'mongo-3:27017', priority: 1 }
        ]
    });
}
catch (err) {
    console.error(err);
    throw err;
}
