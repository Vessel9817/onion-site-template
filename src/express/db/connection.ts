import { type Server } from 'http';
import mongoose from 'mongoose';
import { dbRetryIntervalMs, forceShutdownTimeoutMs } from '../env';

/**
 * @returns Whether the database is currently usable
 */
export function isConnected(): boolean {
    return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
}

/**
 * Connects to the database, retrying until it succeeds.
 * Does nothing if a connection is already open or being opened.
 * @param uri The connection string
 */
export async function connect(
    uri: string
): Promise<void> {
    if (mongoose.connection.readyState !== mongoose.ConnectionStates.disconnected) {
        return;
    }

    try {
        await mongoose.connect(uri);
    }
    catch (err) {
        // Not the message, which can carry the connection string
        const name = err instanceof Error ? err.name : 'unknown error';

        console.error(`Database connection failed (${name}), retrying`);

        // Mongoose can fail after the driver connected, as on a '.' in the database name
        await mongoose.connection.close().catch(() => undefined);
        setTimeout(() => void connect(uri), dbRetryIntervalMs);
    }
}

/**
 * Handles process and server signals to cleanly close
 * server and database connections on shutdown.
 * Should only be attached once, before server connections are opened.
 * @param server The server to manage
 */
export function createShutdownHandler(server: Server): void {
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
        setTimeout(() => process.exit(1), forceShutdownTimeoutMs);

        // Finishes in-flight requests first
        server.close(() => {
            mongoose.disconnect().then(
                () => process.exit(0),
                () => process.exit(1)
            );
        });
    }

    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
}
