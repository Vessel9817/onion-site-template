import assert from 'node:assert';

assert.ok(
    process.env.ME_CONFIG_MONGODB_AUTHDB,
    'MongoDB authentication database is missing from env'
);
export const AUTH_DB = process.env.ME_CONFIG_MONGODB_AUTHDB;

assert.ok(
    process.env.ME_CONFIG_MONGODB_URL,
    'MongoDB connetion string is missing from env'
);
export const CONNECTION_STRING = process.env.ME_CONFIG_MONGODB_URL;

assert.ok(
    process.env.ME_CONFIG_MONGODB_CONTAINERNAME,
    'MongoDB container name is missing from env'
);
// Preventing arbitrary code execution
assert.ok(
    /^[a-z0-9_-]+$/gi.test(process.env.ME_CONFIG_MONGODB_CONTAINERNAME),
    'MongoDB container name is invalid'
);
export const CONTAINER_NAME = process.env.ME_CONFIG_MONGODB_CONTAINERNAME;
