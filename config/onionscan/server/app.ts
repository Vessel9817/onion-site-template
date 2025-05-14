import express, { type RequestHandler } from 'express';
import cors from 'cors';
import path from 'node:path';
import { createServer } from '@pondwader/socks5-server';
import net from 'node:net';

// Verifying env vars
const TOR_HOST = process.env.TOR_HOST;
const TOR_HOST_PORT = Number(process.env.TOR_HOST_PORT);

if (TOR_HOST == null) {
    throw new Error('Tor host is undefined');
} else if (TOR_HOST_PORT == null || isNaN(TOR_HOST_PORT)) {
    throw new Error('Tor host port is invalid or undefined');
}

function startHttpServer(port: number) {
    const APP = express();

    APP.use(cors());
    APP.use(express.json());
    APP.use(express.urlencoded({ extended: false }));

    const handler: RequestHandler = (req, res) => {
        // Starting SOCKS5 server
        const READY = new Promise<void>((resolve) => {
            SERVER.close(() => resolve());
        });
        startSocks5Server(port, READY);

        res.statusMessage = 'Tor is not an HTTP Proxy';
        res.status(501).sendFile(path.join(__dirname, 'html', 'error.html'));
    };

    APP.get('/', handler);

    APP.on('error', (err) => {
        console.error(`HTTP server error: ${err}`);
    });

    const SERVER = APP.listen(port, () => {
        console.log(`HTTP server started!`);
    });

    SERVER.on('close', () => {
        console.log(`HTTP server stopped!`);
    });
}

function startSocks5Server(port: number, ready: Promise<void>): void {
    const SERVER = createServer();

    SERVER.setConnectionHandler((connection, sendStatus) => {
        const SOCKET = connection.socket;

        // Allowing connection
        sendStatus('REQUEST_GRANTED');

        // Proxying data to tor
        const TARGET = net.createConnection(TOR_HOST_PORT, TOR_HOST, () => {
            console.log(`Connected to upstream server!`);
            SOCKET.pipe(TARGET);
            TARGET.pipe(SOCKET);
        });

        TARGET.on('close', () => {
            SOCKET.destroy();
            TARGET.unpipe(SOCKET);
            TARGET.destroy();
        });

        SOCKET.on('close', () => {
            SOCKET.unpipe(TARGET);
            SOCKET.destroy();
            TARGET.destroy();
        });

        SOCKET.on('error', (err) => {
            SOCKET.destroy(new Error(`Socket error: ${err}`));
        });

        TARGET.on('error', (err) => {
            TARGET.destroy(new Error(`tor error: ${err}`));
        });
    });

    // Starting SOCKS5 server after HTTP server has stopped
    ready.then(() => {
        SERVER.listen(port, () => {
            console.log('SOCKS5 server started!');
        });
    });
}

// Starting HTTP server
const PORT = 9150;

startHttpServer(PORT);
