import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import path from 'path';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.ASSET_PATH = '/';

// Env-dependent imports
const config: webpack.Configuration = require('../webpack.config');
const env = require('./env');

// TODO Move extraneous configuration here
// @ts-expect-error
let options = config.chromeExtensionBoilerplate || {};
let excludeEntriesToHotReload = options.notHotReload || [];

// TODO This `as` statement is awful and presumptuous
const entry = (config.entry = (config.entry || {}) as {
    [key: string]: string;
});

for (let entryName in entry) {
    if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
        // TODO Wait, this is already in our webpack config!
        config.entry[entryName] = [
            'webpack/hot/dev-server',
            `webpack-dev-server/client?hot=true&hostname=localhost&port=${env.PORT}`
        ].concat(entry[entryName]);
    }
}

// @ts-expect-error
delete config.chromeExtensionBoilerplate;

let compiler = webpack(config);

let server = new WebpackDevServer(
    {
        https: false,
        hot: true,
        liveReload: false,
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
