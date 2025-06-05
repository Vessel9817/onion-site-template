// Validates and exports env vars
const assert = require('node:assert');

assert.ok(
    process.env.MONGO_INITDB_DATABASE,
    'MONGO_INITDB_DATABASE is missing from env'
);
const DB_NAME = process.env.MONGO_INITDB_DATABASE;

assert.ok(
    process.env.MONGO_INITDB_ROOT_USERNAME,
    'MONGO_INITDB_ROOT_USERNAME is missing from env'
);
const ADMIN_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME;

assert.ok(
    process.env.MONGO_INITDB_ROOT_PASSWORD,
    'MONGO_INITDB_ROOT_PASSWORD is missing from env'
);
const ADMIN_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;

assert.ok(
    process.env.MONGO_INITDB_USERNAME,
    'MONGO_INITDB_USERNAME is missing from env'
);
const USER_USERNAME = process.env.MONGO_INITDB_USERNAME;

assert.ok(
    process.env.MONGO_INITDB_PASSWORD,
    'MONGO_INITDB_PASSWORD is missing from env'
);
const USER_PASSWORD = process.env.MONGO_INITDB_PASSWORD;

assert.ok(
    process.env.MSG_COLLECTION_NAME,
    'Message collection name is missing from env'
);
const MSG_COLLECTION_NAME = process.env.MSG_COLLECTION_NAME;

module.exports = {
    dbName: DB_NAME,
    collectionName: MSG_COLLECTION_NAME,
    admin: {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
    },
    user: {
        username: USER_USERNAME,
        password: USER_PASSWORD
    }
};
