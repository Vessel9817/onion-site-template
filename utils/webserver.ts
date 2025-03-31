import assert from 'node:assert';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

// Do this first so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Env-dependent imports
const config: webpack.Configuration = require('../webpack.config');
const env = require('./env');

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
        port: env.PORT,
        static: {
            directory: path.join(__dirname, '../build')
        },
        devMiddleware: {
            publicPath: `http://localhost:${env.PORT}/`,
            writeToDisk: true
        },
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        allowedHosts: 'all'
    },
    compiler
);

// Running server
(async () => {
    await server.start();
})();
