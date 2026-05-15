// Validates and exports env vars
import assert from 'node:assert';

const nodeEnv = process.env.NODE_ENV;
assert.ok(nodeEnv, 'NODE_ENV is missing from env');
assert.ok(
    ['production', 'development'].includes(nodeEnv),
    'NODE_ENV must be "production" or "development"'
);
export const NODE_ENV = nodeEnv as 'production' | 'development';
