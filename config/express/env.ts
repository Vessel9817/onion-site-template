// Validates and exports env vars
import assert from 'node:assert';

assert.ok(process.env.BROKERS, 'Broker addresses are missing from env');
export const BROKERS = process.env.BROKERS.split(',');

assert.ok(process.env.GROUP_ID, 'Consumer group ID not set');
export const GROUP_ID = process.env.GROUP_ID;
