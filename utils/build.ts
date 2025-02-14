import webpack from 'webpack';
import path from 'path';
import fs from 'fs';
import ZipPlugin from 'zip-webpack-plugin';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
process.env.ASSET_PATH = '/';

// Env-dependent imports
const config: webpack.Configuration = require('../webpack.config');

// @ts-expect-error TODO
delete config.chromeExtensionBoilerplate;

// Zipping extension
let packageInfo = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

config.plugins = (config.plugins || []).concat(
    new ZipPlugin({
        filename: `${packageInfo.name}-${packageInfo.version}.zip`,
        path: path.join(__dirname, '../', 'zip')
    })
);

webpack(config, function (err) {
    if (err) throw err;
});
