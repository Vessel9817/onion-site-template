import assert from 'node:assert';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Env-dependent imports
const config: webpack.Configuration = require('../webpack.config');

// Validating env variables
assert(process.env.PORT != null);

let compiler = webpack(config);

let server = new WebpackDevServer(
    {
        // historyApiFallback: true,
        // https: false,
        hot: true,
        liveReload: true,
        client: {
            webSocketTransport: 'sockjs'
        },
        webSocketServer: 'sockjs',
        host: 'localhost',
        port: process.env.PORT,
        static: {
            directory: path.join(__dirname, '../build')
        },
        devMiddleware: {
            publicPath: `http://localhost:${process.env.PORT}`,
            writeToDisk: true
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Security-Policy': `script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' http://localhost:*`
        },
        allowedHosts: 'all'
    },
    compiler
);

// Running server
(async () => {
    await server.start();
})();
