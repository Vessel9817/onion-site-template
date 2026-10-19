/**
 * Validates and exports environment variables
 */

import assert from 'node:assert';

// MongoDB URI
assert.ok(process.env.MONGODB_URI, 'MongoDB URI is missing from env');

const msgBoard = {
    uri: process.env.MONGODB_URI
};

// Forced shutdown timeout
assert.ok(
    process.env.FORCE_SHUTDOWN_TIMEOUT_MS,
    'Forced shutdown timeout is missing from env'
);

/**
 * The time, in milliseconds, after a shutdown has commenced
 * that an immediate shutdown should be forced
 */
const forceShutdownTimeoutMs = Number.parseInt(process.env.FORCE_SHUTDOWN_TIMEOUT_MS);

assert.ok(
    forceShutdownTimeoutMs > 0,
    'Forced shutdown timeout must be positive'
);

// DB connection retry interval
assert.ok(
    process.env.DB_RETRY_INTERVAL_MS,
    'Database connection retry interval is missing from env'
);

/**
 * The interval, in milliseconds, in which failed database connections
 * should be retried
 */
const dbRetryIntervalMs = Number.parseInt(process.env.DB_RETRY_INTERVAL_MS);

assert.ok(
    dbRetryIntervalMs > 0,
    'Database connection retry interval must be positive'
);

export {
    dbRetryIntervalMs,
    forceShutdownTimeoutMs,
    msgBoard
};
