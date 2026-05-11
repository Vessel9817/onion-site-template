// Validates and exports env vars
import assert from 'node:assert';

assert.ok(process.env.MONGODB_URI, 'MongoDB URI is missing from env');
export const MONGODB_URI = process.env.MONGODB_URI;

assert.ok(process.env.ONION_HOSTNAME, 'Onion hostname is missing from env');
export const DOMAIN = process.env.ONION_HOSTNAME;
