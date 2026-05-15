// Validates and exports env vars
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeEnv = process.env.NODE_ENV;
assert.ok(nodeEnv, 'NODE_ENV is missing from env');
assert.ok(
    ['production', 'development'].includes(nodeEnv),
    'NODE_ENV must be "production" or "development"'
);
export const NODE_ENV = nodeEnv as 'production' | 'development';

const defaultRoot = path.join(__dirname, '..');
export const PROJECT_ROOT = path.join(defaultRoot, process.env.PROJECT_ROOT ?? '.');
