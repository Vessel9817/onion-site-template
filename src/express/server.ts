import app from './app';
import mongoose from 'mongoose';
import { connect } from './db/connection';
import { msgBoard } from './env';

const port = 3000;
// Under the stop_grace_period in src/docker-compose.yml
const STOP_TIMEOUT_MS = 8000;

// Starting server
void connect(msgBoard.uri);

const server = app.listen(port, () => {
    console.log('Server is running!');
});

// Stopping server
let stopping = false;

// A keep-alive socket busy at the signal would otherwise stay open until it times out
server.on('request', (_req, res) => {
    res.on('finish', () => {
        if (stopping) {
            setImmediate(() => {
                server.closeIdleConnections();
            });
        }
    });
});

/**
 * Stops the server, then the database connection, and exits
 * @param signal The signal that asked express to stop
 */
function stop(signal: NodeJS.Signals): void {
    if (stopping) {
        process.exit(1);
    }

    stopping = true;
    console.log(`${signal} received, stopping`);
    setTimeout(() => process.exit(1), STOP_TIMEOUT_MS);
    // Finishes in-flight requests first
    server.close(() => {
        mongoose.disconnect().then(() => process.exit(0), () => process.exit(1));
    });
}

process.on('SIGTERM', stop);
process.on('SIGINT', stop);
