// Validates and exports env vars
import assert from 'node:assert';

assert.ok(process.env.BROKERS, 'Broker addresses are missing from env');
export const BROKERS = process.env.BROKERS.split(',');

assert.ok(process.env.MONGODB_URI, 'MongoDB URI is missing from env');
export const MONGODB_URI = process.env.MONGODB_URI;
