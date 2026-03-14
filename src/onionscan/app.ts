import cors from 'cors';
import express from 'express';
import net from 'node:net';
import path from 'node:path';
import { Duplex } from 'node:stream';

interface ConnectionOptions {
    hostname: string;
    port: number;
}

interface HttpSocksOptions {
    http: ConnectionOptions;
    socks5: ConnectionOptions;
}

// Verifying env vars
const UPSTREAM_SOCKS5_HOSTNAME = process.env.UPSTREAM_SOCKS5_HOSTNAME;
const UPSTREAM_SOCKS5_PORT = Number(process.env.UPSTREAM_SOCKS5_PORT);
const HTTP_PORT = Number(process.env.HTTP_PORT);
const SERVER_PORT = Number(process.env.SERVER_PORT);

if (UPSTREAM_SOCKS5_HOSTNAME == null) {
    throw new TypeError('Upstream SOCKS5 hostname is undefined');
}
else if (Number.isNaN(UPSTREAM_SOCKS5_PORT)) {
    throw new TypeError('Upstream SOCKS5 port is invalid or undefined');
}
else if (Number.isNaN(HTTP_PORT)) {
    throw new TypeError('HTTP port is invalid or undefined');
}
else if (Number.isNaN(SERVER_PORT)) {
    throw new TypeError('Server port is invalid or undefined');
}

function createProxy(
    connection: Duplex,
    upstream: ConnectionOptions,
    protocol: string
): net.Socket {
    const uri = `${protocol}://${upstream.hostname}:${upstream.port.toString()}`;
    const proxy = net.createConnection(upstream.port, upstream.hostname, () => {
        console.log(`Connected to upstream server: ${uri}`);
        connection.pipe(proxy);
        proxy.pipe(connection);
    });

    proxy.on('close', () => {
        console.log(`Disconnected from upstream server: ${uri}`);
        connection.destroy();
        proxy.unpipe(connection);
        proxy.destroy();
    });

    connection.on('close', () => {
        connection.unpipe(proxy);
        connection.destroy();
        proxy.destroy();
    });

    return proxy;
}

function startHttpServer(port: number) {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.get('/', (req, res) => {
        res.statusMessage = 'Tor is not an HTTP Proxy';
        res.status(501).sendFile(path.join(__dirname, 'html', 'error.html'));
    });

    const server = app.listen(port, () => {
        console.log(`HTTP server started!`);
    });

    server.on('close', () => {
        console.log(`HTTP server stopped!`);
    });

    return server;
}

function createHttpSocksServer(options: HttpSocksOptions): net.Server {
    return net.createServer((socket: net.Socket) => {
        socket.once('data', (buf) => {
            // Establishing a proxy connection could take a while.
            // Unfortunately, if the proxy takes a long time, we could be
            // blocking other connections. Onionscan will keep retrying.
            socket.cork();

            let proxy: net.Socket;

            if (buf[0] == 0x05) {
                console.info('Creating SOCKS5 proxy...');
                proxy = createProxy(socket, options.socks5, 'socks5');
            }
            /*
            else if (buf[0] == 0x04) {
                // Could also be SOCKS4a
                proxy = createProxy(socket, options.socks4, 'socks4');
            }
            else if (buf[0] == 0x16) {
                proxy = createProxy(socket, options.https, 'https');
            }
            */
            else {
                console.info('Creating HTTP proxy...');

                proxy = createProxy(socket, options.http, 'http');
            }

            // Catching up
            proxy.write(buf);
            socket.uncork();
        });
    });
}

// Starting HTTP server/SOCKS proxy server
startHttpServer(HTTP_PORT);

const server = createHttpSocksServer({
    http: {
        hostname: 'localhost',
        port: HTTP_PORT
    },
    socks5: {
        hostname: UPSTREAM_SOCKS5_HOSTNAME,
        port: UPSTREAM_SOCKS5_PORT
    }
});

server.listen(SERVER_PORT);
