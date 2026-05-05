// Validates and exports env vars
import assert from 'node:assert';

assert.ok(process.env.NODE_ENV, 'NODE_ENV is missing from env');
assert.ok(
    ['production', 'development'].includes(process.env.NODE_ENV),
    'NODE_ENV must be "production" or "development"'
);
export const NODE_ENV = process.env.NODE_ENV as 'production' | 'development';
