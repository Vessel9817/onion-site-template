/* Exports env vars after type-asserting them at runtime */
const assert = require('node:assert');

const { PORT } = process.env;

assert.ok(PORT != null, 'Express server port is not set');

export { PORT };
